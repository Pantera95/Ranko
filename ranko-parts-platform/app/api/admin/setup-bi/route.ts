import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

/**
 * POST /api/admin/setup-bi
 *
 * Crea las 5 tablas + 4 enums del módulo BI Reportes vía SQL crudo,
 * de forma idempotente (IF NOT EXISTS). Sirve como fallback cuando
 * `prisma db push` falla durante el build de Vercel.
 *
 * Solo accesible para roles equipo. La operación es safe — si las
 * tablas ya existen, no hace nada.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const DDL_STATEMENTS = [
  // ── Enums ──────────────────────────────────────────────────────────────
  `DO $$ BEGIN
    CREATE TYPE "TipoReporte" AS ENUM ('VENTAS', 'GASTOS', 'ESTADO_FINANCIERO');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `DO $$ BEGIN
    CREATE TYPE "FormatoReporte" AS ENUM ('XLS', 'XLSX', 'DOCX', 'DOC', 'PDF');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `DO $$ BEGIN
    CREATE TYPE "EstadoReporteProc" AS ENUM ('PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'ERROR');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `DO $$ BEGIN
    CREATE TYPE "TipoMeta" AS ENUM ('REVENUE_MENSUAL', 'REVENUE_ANUAL', 'MARGEN_BRUTO_PCT', 'UTILIDAD_NETA_MENSUAL', 'GASTO_OPERATIVO_MAX', 'TICKET_PROMEDIO_MIN', 'TICKET_PROMEDIO_MAX', 'TRANSACCIONES_MENSUAL_MIN');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  // ── ReporteUpload ──────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "ReporteUpload" (
    "id" TEXT NOT NULL,
    "tipo" "TipoReporte" NOT NULL,
    "formato" "FormatoReporte" NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "periodoInicio" TIMESTAMP(3),
    "periodoFin" TIMESTAMP(3),
    "filasParseadas" INTEGER NOT NULL DEFAULT 0,
    "filasImportadas" INTEGER NOT NULL DEFAULT 0,
    "filasAnuladas" INTEGER NOT NULL DEFAULT 0,
    "estadoProceso" "EstadoReporteProc" NOT NULL DEFAULT 'PENDIENTE',
    "errorMensaje" TEXT,
    "resumenIA" TEXT,
    "metadata" JSONB,
    "subidoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReporteUpload_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ReporteUpload_subidoPorId_fkey" FOREIGN KEY ("subidoPorId")
      REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "ReporteUpload_tipo_createdAt_idx" ON "ReporteUpload"("tipo", "createdAt");`,
  `CREATE INDEX IF NOT EXISTS "ReporteUpload_periodoInicio_periodoFin_idx" ON "ReporteUpload"("periodoInicio", "periodoFin");`,

  // ── VentaImportada ─────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "VentaImportada" (
    "id" TEXT NOT NULL,
    "reporteId" TEXT NOT NULL,
    "numero" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "sku" TEXT,
    "producto" TEXT,
    "cliente" TEXT,
    "vendedor" TEXT,
    "almacen" TEXT,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "unidad" TEXT,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "descuentoPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "neto" DECIMAL(12,2) NOT NULL,
    "anulada" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    CONSTRAINT "VentaImportada_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "VentaImportada_reporteId_fkey" FOREIGN KEY ("reporteId")
      REFERENCES "ReporteUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "VentaImportada_fecha_idx" ON "VentaImportada"("fecha");`,
  `CREATE INDEX IF NOT EXISTS "VentaImportada_sku_idx" ON "VentaImportada"("sku");`,
  `CREATE INDEX IF NOT EXISTS "VentaImportada_cliente_idx" ON "VentaImportada"("cliente");`,
  `CREATE INDEX IF NOT EXISTS "VentaImportada_vendedor_idx" ON "VentaImportada"("vendedor");`,
  `CREATE INDEX IF NOT EXISTS "VentaImportada_reporteId_idx" ON "VentaImportada"("reporteId");`,

  // ── GastoImportado ─────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "GastoImportado" (
    "id" TEXT NOT NULL,
    "reporteId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT,
    "proveedor" TEXT,
    "descripcion" TEXT,
    "monto" DECIMAL(12,2) NOT NULL,
    "esRecurrente" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    CONSTRAINT "GastoImportado_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GastoImportado_reporteId_fkey" FOREIGN KEY ("reporteId")
      REFERENCES "ReporteUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "GastoImportado_fecha_idx" ON "GastoImportado"("fecha");`,
  `CREATE INDEX IF NOT EXISTS "GastoImportado_categoria_idx" ON "GastoImportado"("categoria");`,
  `CREATE INDEX IF NOT EXISTS "GastoImportado_reporteId_idx" ON "GastoImportado"("reporteId");`,

  // ── EstadoFinanciero ───────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "EstadoFinanciero" (
    "id" TEXT NOT NULL,
    "reporteId" TEXT NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFin" TIMESTAMP(3) NOT NULL,
    "ingresoTotal" DECIMAL(14,2) NOT NULL,
    "costoVentas" DECIMAL(14,2) NOT NULL,
    "utilidadBruta" DECIMAL(14,2) NOT NULL,
    "gastosOperativos" DECIMAL(14,2) NOT NULL,
    "ebitda" DECIMAL(14,2) NOT NULL,
    "utilidadNeta" DECIMAL(14,2) NOT NULL,
    "metadata" JSONB,
    CONSTRAINT "EstadoFinanciero_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EstadoFinanciero_reporteId_fkey" FOREIGN KEY ("reporteId")
      REFERENCES "ReporteUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "EstadoFinanciero_periodoInicio_periodoFin_idx" ON "EstadoFinanciero"("periodoInicio", "periodoFin");`,

  // ── MetaFinanciera ─────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "MetaFinanciera" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMeta" NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "notas" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetaFinanciera_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MetaFinanciera_tipo_key" UNIQUE ("tipo")
  );`,

  // ── Default IDs vía cuid (Postgres no tiene cuid nativo; usamos uuid-like)
  // Las tablas usan TEXT como id porque prisma genera cuids del lado app.
  // No necesitamos default — la app siempre provee el id.
];

async function tablesAlreadyExist(): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'ReporteUpload'
    ) as exists
  `;
  return result[0]?.exists === true;
}

export async function POST() {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const alreadyExists = await tablesAlreadyExist().catch(() => false);
  if (alreadyExists) {
    return Response.json({
      ok: true,
      message: "Las tablas BI ya existen. Nada que hacer.",
      provisioned: false,
    });
  }

  const errors: { statement: number; error: string }[] = [];
  let success = 0;

  for (let i = 0; i < DDL_STATEMENTS.length; i++) {
    try {
      await prisma.$executeRawUnsafe(DDL_STATEMENTS[i]);
      success++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Errores benignos: tabla/índice ya existe, enum ya existe
      if (/already exists|duplicate/i.test(msg)) {
        success++;
        continue;
      }
      errors.push({ statement: i, error: msg.slice(0, 300) });
    }
  }

  if (errors.length > 0) {
    return Response.json(
      { ok: false, errors, success, total: DDL_STATEMENTS.length },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    message: `Tablas BI provisionadas. ${success}/${DDL_STATEMENTS.length} statements ejecutados.`,
    provisioned: true,
  });
}

export async function GET() {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const exists = await tablesAlreadyExist().catch(() => false);
  return Response.json({ ok: true, tablesProvisioned: exists });
}
