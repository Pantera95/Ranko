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

  // ── 2. Crear ReporteUpload pending ─────────────────────────────────────────
  const reporte = await prisma.reporteUpload.create({
    data: {
      tipo,
      formato,
      nombreArchivo: file.name,
      archivoUrl: blob.url,
      tamanoBytes: file.size,
      estadoProceso: "PROCESANDO",
      subidoPorId: session.user.id,
    },
  });

  // ── 3-4. Parse + import ────────────────────────────────────────────────────
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (tipo === "VENTAS" && (formato === "XLS" || formato === "XLSX")) {
      const result = parseVentasXLS(buffer);
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
