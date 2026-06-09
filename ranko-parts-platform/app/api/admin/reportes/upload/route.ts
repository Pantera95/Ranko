import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";
import { uploadReportBlob } from "@/lib/blob-storage";
import { parseVentasXLS } from "@/lib/parsers/ventas-xls";

/**
 * POST /api/admin/reportes/upload
 *
 * Recibe un archivo (FormData: `file` + `tipo`) y lo procesa:
 *   1. Sube el archivo a Vercel Blob.
 *   2. Crea registro ReporteUpload (estado: PROCESANDO).
 *   3. Parsea el contenido según tipo + formato detectado.
 *   4. Importa las filas a la tabla específica (VentaImportada/...).
 *   5. Marca el reporte como COMPLETADO con resumen + metadata.
 *
 * Body (multipart/form-data):
 *   file: File             — el archivo XLS/XLSX/DOCX/PDF
 *   tipo: "VENTAS" | "GASTOS" | "ESTADO_FINANCIERO"
 *
 * Limita a archivos < 10MB. Solo rol equipo.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXT = [".xls", ".xlsx", ".docx", ".doc", ".pdf"] as const;

// Parsing + 8-15 batches de insert pueden tomar 30-60s para archivos con
// miles de filas. Sin esto Vercel mata la función a los 10s (default Hobby).
export const maxDuration = 300; // 5 min máximo (límite Pro plan)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TipoReporte = "VENTAS" | "GASTOS" | "ESTADO_FINANCIERO";
type FormatoReporte = "XLS" | "XLSX" | "DOCX" | "DOC" | "PDF";

function detectFormato(filename: string): FormatoReporte | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".xlsx")) return "XLSX";
  if (lower.endsWith(".xls")) return "XLS";
  if (lower.endsWith(".docx")) return "DOCX";
  if (lower.endsWith(".doc")) return "DOC";
  if (lower.endsWith(".pdf")) return "PDF";
  return null;
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (err) {
    // Cualquier excepción no capturada arriba: devolver JSON con detalle
    // en vez de body vacío + 500 (que produce el inútil "Error de conexión").
    console.error("[reportes/upload] uncaught:", err);
    const e = err as { message?: string; code?: string; meta?: unknown; name?: string };
    return Response.json(
      {
        ok: false,
        error: e.message ?? "Error desconocido",
        code: e.code,
        name: e.name,
        meta: e.meta,
        stack: process.env.NODE_ENV === "production"
          ? undefined
          : err instanceof Error ? err.stack : undefined,
      },
      { status: 500 },
    );
  }
}

function logMem(label: string) {
  if (typeof process === "undefined" || !process.memoryUsage) return;
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(0)}MB`;
  const u = process.memoryUsage();
  console.log(`[upload/mem] ${label} rss=${mb(u.rss)} heap=${mb(u.heapUsed)}/${mb(u.heapTotal)} ext=${mb(u.external)}`);
}

async function handlePost(request: Request) {
  logMem("start");
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (!session?.user?.id) {
    return Response.json({ ok: false, error: "Sesión inválida" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return Response.json({ ok: false, error: "Body inválido" }, { status: 400 });
  }

  const file = form.get("file");
  const tipo = String(form.get("tipo") ?? "").toUpperCase() as TipoReporte;

  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "Falta el archivo" }, { status: 400 });
  }
  if (!["VENTAS", "GASTOS", "ESTADO_FINANCIERO"].includes(tipo)) {
    return Response.json({ ok: false, error: "Tipo de reporte no válido" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { ok: false, error: `Archivo demasiado grande (máximo ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }
  const formato = detectFormato(file.name);
  if (!formato) {
    return Response.json(
      { ok: false, error: `Formato no soportado. Use: ${ALLOWED_EXT.join(", ")}` },
      { status: 400 },
    );
  }

  // ── 1. Upload a Vercel Blob ────────────────────────────────────────────────
  let blob;
  try {
    blob = await uploadReportBlob(file, { tipo, uploaderId: session.user.id });
  } catch (err) {
    console.error("[reportes/upload] blob upload failed:", err);
    return Response.json(
      { ok: false, error: "No se pudo subir el archivo al storage. Verifica que Vercel Blob esté habilitado." },
      { status: 503 },
    );
  }

  // ── 1.5 Resolver subidoPorId ───────────────────────────────────────────────
  // Si el usuario logueado es una cuenta demo (id "demo-*"), su ID no existe
  // en la tabla Usuario y la FK fallaría. En ese caso usamos el primer
  // MASTER_ADMIN/ADMIN real, o creamos uno "sistema" si no hay ninguno.
  let subidoPorId = session.user.id;
  if (subidoPorId.startsWith("demo-")) {
    const realAdmin = await prisma.usuario.findFirst({
      where: { rol: { in: ["MASTER_ADMIN", "ADMIN"] as never } },
      select: { id: true },
    }).catch(() => null);

    if (realAdmin) {
      subidoPorId = realAdmin.id;
    } else {
      // No hay admins reales — creamos uno de sistema (bcrypt hash de password
      // imposible para que nadie pueda loguear como él).
      const sys = await prisma.usuario.upsert({
        where: { email: "sistema@ranko.internal" },
        create: {
          email: "sistema@ranko.internal",
          nombre: "Sistema (importaciones BI)",
          passwordHash: "$2a$10$IMPOSIBLE.LOGIN.DESDE.CUENTA.DEMO.NO.SE.PUEDE.AUTH",
          rol: "MASTER_ADMIN",
          activo: false,
        },
        update: {},
        select: { id: true },
      });
      subidoPorId = sys.id;
    }
  }

  // ── 2. Crear ReporteUpload pending ─────────────────────────────────────────
  // Si las tablas BI no existen (porque `prisma db push` no corrió bien en
  // el build de Vercel), auto-provisionamos con DDL crudo idempotente.
  let reporte;
  try {
    reporte = await prisma.reporteUpload.create({
      data: {
        tipo,
        formato,
        nombreArchivo: file.name,
        archivoUrl: blob.url,
        tamanoBytes: file.size,
        estadoProceso: "PROCESANDO",
        subidoPorId,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/does not exist|relation .* does not exist|P2021/i.test(msg)) {
      console.warn("[reportes/upload] tablas BI ausentes — auto-provisionando...");
      const setupRes = await fetch(new URL("/api/admin/setup-bi", request.url), {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });
      if (!setupRes.ok) {
        const setupBody = await setupRes.text();
        return Response.json(
          { ok: false, error: `No se pudieron crear las tablas BI: ${setupBody.slice(0, 200)}` },
          { status: 500 },
        );
      }
      // Reintentar después de provisionar
      reporte = await prisma.reporteUpload.create({
        data: {
          tipo,
          formato,
          nombreArchivo: file.name,
          archivoUrl: blob.url,
          tamanoBytes: file.size,
          estadoProceso: "PROCESANDO",
          subidoPorId,
        },
      });
    } else {
      throw err;
    }
  }

  // ── 3-4. Parse + import ────────────────────────────────────────────────────
  try {
    logMem("before-buffer");
    const buffer = Buffer.from(await file.arrayBuffer());
    logMem(`after-buffer (file=${(file.size / 1024).toFixed(0)}KB)`);

    if (tipo === "VENTAS" && (formato === "XLS" || formato === "XLSX")) {
      const result = parseVentasXLS(buffer);
      logMem(`after-parse (${result.ventas.length} rows)`);
      if (result.ventas.length === 0) {
        await prisma.reporteUpload.update({
          where: { id: reporte.id },
          data: {
            estadoProceso: "ERROR",
            errorMensaje: "No se detectaron filas de venta en el archivo.",
            metadata: result.metadata,
          },
        });
        return Response.json({ ok: false, error: "Archivo sin datos de venta detectables" }, { status: 422 });
      }

      // Insert in batches to avoid DB timeouts
      const BATCH = 500;
      let inserted = 0;
      for (let i = 0; i < result.ventas.length; i += BATCH) {
        const slice = result.ventas.slice(i, i + BATCH);
        const created = await prisma.ventaImportada.createMany({
          data: slice.map((v) => ({
            reporteId: reporte.id,
            numero: v.numero,
            fecha: v.fecha,
            sku: v.sku,
            producto: v.producto,
            cliente: v.cliente,
            vendedor: v.vendedor,
            almacen: v.almacen,
            cantidad: v.cantidad,
            unidad: v.unidad,
            precioUnitario: v.precioUnitario,
            descuentoPct: v.descuentoPct,
            neto: v.neto,
            anulada: v.anulada,
          })),
          skipDuplicates: false,
        });
        inserted += created.count;
      }

      const totalNeto = result.ventas
        .filter((v) => !v.anulada)
        .reduce((s, v) => s + v.neto, 0);
      const resumen =
        `Procesadas ${result.filasParseadas} filas (${inserted} importadas, ` +
        `${result.filasAnuladas} anuladas). Período ${result.periodoInicio?.toISOString().slice(0, 10)} → ` +
        `${result.periodoFin?.toISOString().slice(0, 10)}. ` +
        `Revenue: $${totalNeto.toFixed(2)}. ` +
        `${result.metadata.skusUnicos} SKUs únicos, ${result.metadata.clientesUnicos} clientes.`;

      const updated = await prisma.reporteUpload.update({
        where: { id: reporte.id },
        data: {
          estadoProceso: "COMPLETADO",
          filasParseadas: result.filasParseadas,
          filasImportadas: inserted,
          filasAnuladas: result.filasAnuladas,
          periodoInicio: result.periodoInicio,
          periodoFin: result.periodoFin,
          resumenIA: resumen,
          metadata: {
            ...result.metadata,
            filasSaltadas: result.filasSaltadas,
            revenueTotal: totalNeto,
          },
        },
      });

      return Response.json({ ok: true, reporte: updated, resumen });
    }

    // ── Stubs para GASTOS y ESTADO_FINANCIERO ────────────────────────────────
    // Los parsers respectivos se implementan cuando lleguen los archivos de
    // muestra del cliente (acordado en planning).
    await prisma.reporteUpload.update({
      where: { id: reporte.id },
      data: {
        estadoProceso: "ERROR",
        errorMensaje: `Parser para ${tipo} en formato ${formato} aún no implementado. Solo VENTAS (XLS/XLSX) está activo.`,
      },
    });
    return Response.json(
      { ok: false, error: `Tipo ${tipo} en formato ${formato} aún no soportado. Por ahora solo VENTAS en XLS/XLSX.` },
      { status: 501 },
    );
  } catch (err) {
    console.error("[reportes/upload] parse/import failed:", err);
    const msg = err instanceof Error ? err.message : "Error desconocido al procesar";
    await prisma.reporteUpload.update({
      where: { id: reporte.id },
      data: { estadoProceso: "ERROR", errorMensaje: msg.slice(0, 500) },
    });
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
