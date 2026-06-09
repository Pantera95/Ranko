import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";
import { deleteReportBlob } from "@/lib/blob-storage";

type Context = { params: Promise<{ id: string }> };

/**
 * DELETE /api/admin/reportes/[id]
 * Elimina un reporte subido + todas sus filas importadas (cascade) + el
 * archivo original en Vercel Blob. Acción irreversible.
 */
export async function DELETE(_request: Request, context: Context) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const reporte = await prisma.reporteUpload
    .findUnique({ where: { id }, select: { id: true, archivoUrl: true } })
    .catch(() => null);

  if (!reporte) {
    return Response.json({ ok: false, error: "Reporte no encontrado" }, { status: 404 });
  }

  try {
    // Cascade delete handles VentaImportada/GastoImportado/EstadoFinanciero
    await prisma.reporteUpload.delete({ where: { id } });
    await deleteReportBlob(reporte.archivoUrl);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[reportes/delete]", err);
    return Response.json({ ok: false, error: "No se pudo eliminar" }, { status: 503 });
  }
}
