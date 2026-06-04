import type { Prisma } from "@prisma/client";

export type DeductionItem = { productoId: string; cantidad: number };

export type StockShortage = {
  productoId: string;
  sku: string;
  nombre: string;
  pedido: number;
  disponible: number;
};

/**
 * Validates that the requested quantities are fully covered by existing
 * inventory across all warehouses. Returns an array of shortages (empty when
 * everything is satisfiable). Aggregates by productoId — multiple line items
 * for the same producto are summed before checking.
 */
export async function checkStockAvailability(
  tx: Prisma.TransactionClient,
  items: DeductionItem[],
): Promise<StockShortage[]> {
  const requested = new Map<string, number>();
  for (const item of items) {
    requested.set(item.productoId, (requested.get(item.productoId) ?? 0) + item.cantidad);
  }
  const productoIds = [...requested.keys()];
  if (productoIds.length === 0) return [];

  const [stockRows, productos] = await Promise.all([
    tx.inventario.groupBy({
      by: ["productoId"],
      where: { productoId: { in: productoIds } },
      _sum: { cantidad: true },
    }),
    tx.producto.findMany({
      where: { id: { in: productoIds } },
      select: { id: true, sku: true, nombre: true },
    }),
  ]);

  const stockById = new Map(stockRows.map((r) => [r.productoId, r._sum.cantidad ?? 0]));
  const prodById = new Map(productos.map((p) => [p.id, p]));

  const shortages: StockShortage[] = [];
  for (const [productoId, pedido] of requested) {
    const disponible = stockById.get(productoId) ?? 0;
    if (disponible < pedido) {
      const prod = prodById.get(productoId);
      shortages.push({
        productoId,
        sku: prod?.sku ?? "—",
        nombre: prod?.nombre ?? "Producto desconocido",
        pedido,
        disponible,
      });
    }
  }
  return shortages;
}

/**
 * Decrements inventory for the requested items greedily — pulling from the
 * warehouse with the highest stock first per producto. Must be called inside a
 * transaction. Assumes stock availability has already been verified via
 * {@link checkStockAvailability}; will throw if a producto runs out mid-loop.
 */
export async function deductStockForSale(
  tx: Prisma.TransactionClient,
  items: DeductionItem[],
): Promise<void> {
  // Sum requested per producto (multiple line items for the same SKU)
  const requested = new Map<string, number>();
  for (const item of items) {
    requested.set(item.productoId, (requested.get(item.productoId) ?? 0) + item.cantidad);
  }

  for (const [productoId, totalNeeded] of requested) {
    const rows = await tx.inventario.findMany({
      where: { productoId, cantidad: { gt: 0 } },
      orderBy: { cantidad: "desc" },
      select: { id: true, cantidad: true },
    });

    let remaining = totalNeeded;
    for (const row of rows) {
      if (remaining <= 0) break;
      const take = Math.min(row.cantidad, remaining);
      await tx.inventario.update({
        where: { id: row.id },
        data: {
          cantidad: { decrement: take },
          ultimaActualizacion: new Date(),
        },
      });
      remaining -= take;
    }

    if (remaining > 0) {
      // Should have been caught upstream by checkStockAvailability
      throw new Error(`stock_exhausted:${productoId}:${remaining}`);
    }
  }
}

/**
 * Restores inventory after an invoice is cancelled. Returns stock to the
 * warehouse with the lowest current stock first per producto (rebalances).
 * Must be called inside a transaction.
 */
export async function restoreStockFromSale(
  tx: Prisma.TransactionClient,
  items: DeductionItem[],
): Promise<void> {
  const toRestore = new Map<string, number>();
  for (const item of items) {
    toRestore.set(item.productoId, (toRestore.get(item.productoId) ?? 0) + item.cantidad);
  }

  for (const [productoId, totalReturn] of toRestore) {
    const rows = await tx.inventario.findMany({
      where: { productoId },
      orderBy: { cantidad: "asc" },
      select: { id: true },
    });

    if (rows.length === 0) {
      // No inventory row exists for this producto at any almacén — skip.
      // Manual reconciliation will be needed by warehouse staff.
      continue;
    }

    // Put it all back into the first (lowest-stock) row to rebalance
    await tx.inventario.update({
      where: { id: rows[0].id },
      data: {
        cantidad: { increment: totalReturn },
        ultimaActualizacion: new Date(),
      },
    });
  }
}
