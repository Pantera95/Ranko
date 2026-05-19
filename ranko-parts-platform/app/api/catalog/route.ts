import { getCatalogPageData, type CatalogFilters } from "@/lib/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters: CatalogFilters = {
    categoria: url.searchParams.get("categoria") ?? undefined,
    marca: url.searchParams.get("marca") ?? undefined,
    modelo: url.searchParams.get("modelo") ?? undefined,
    sistema: url.searchParams.get("sistema") ?? undefined,
    anio: parseNumber(url.searchParams.get("anio")),
  };

  const catalog = await getCatalogPageData(filters);

  return Response.json({
    ok: true,
    ...catalog,
  });
}

function parseNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
