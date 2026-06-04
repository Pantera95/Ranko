import "server-only";

import { prisma } from "@/lib/db";

import type { AdminNavCounts } from "@/lib/admin-nav-counts";

const ZERO: AdminNavCounts = {
  pagosPorVerificar: 0,
  facturasVencidas: 0,
  alertasCriticas: 0,
};

/**
 * Server-only fetcher used by the admin layout. Lives in a separate file from
 * the types + badge helper so client components (AdminSidebar, AdminMobileMenu)
 * can import the type without dragging Prisma into the client bundle.
 *
 * All queries are bounded, indexed, and safe to run on every admin page load.
 * Returns zeros on DB error so the sidebar always renders.
 */
export async function getAdminNavCounts(): Promise<AdminNavCounts> {
  try {
    const [pagosPorVerificar, facturasVencidas, pagosAnomalos, facturasMuyVencidas] =
      await Promise.all([
        prisma.pago.count({
          where: { estado: "PENDIENTE_VERIFICACION" },
        }),
        prisma.factura.count({
          where: { estado: "VENCIDA", saldoPendiente: { gt: 0 } },
        }),
        // CRITICA alertas in lib/alertas.ts: anomalous payments that haven't been
        // rejected. Matches the same filter as getAlertasData for consistency.
        prisma.pago.count({
          where: { esAnomalo: true, estado: { not: "RECHAZADO" } },
        }),
        // CRITICA alertas: facturas more than 90 days past due
        prisma.factura.count({
          where: {
            estado: { in: ["VENCIDA", "PENDIENTE", "PARCIAL"] },
            saldoPendiente: { gt: 0 },
            fechaVencimiento: {
              lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return {
      pagosPorVerificar,
      facturasVencidas,
      alertasCriticas: pagosAnomalos + facturasMuyVencidas,
    };
  } catch {
    return ZERO;
  }
}
