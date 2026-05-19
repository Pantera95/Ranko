import {
  ClienteSegmentosChart,
  FacturasChart,
  InventoryTurnoverChart,
  LeadFunnelChart,
  RevenueChart,
  TopSkusChart,
} from "@/components/admin/ReportsCharts";
import { getReportsData } from "@/lib/reports";

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className="p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>{title}</p>
        {subtitle ? <p className="mt-1 text-xs" style={{ color: "var(--text-muted)", opacity: 0.7 }}>{subtitle}</p> : null}
      </div>
      {children}
    </article>
  );
}

export default async function AdminReportesPage() {
  const data = await getReportsData();
  const { summary } = data;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
            Inteligencia
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase">Reportes y BI</h1>
          <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
            Ultimos 12 meses. Ventas, margen, rotacion de inventario, embudo de leads y
            segmentacion de clientes.
          </p>
        </div>

        {data.isFallback ? (
          <div
            className="mt-6 p-4 text-sm"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              color: "var(--text-secondary)",
            }}
          >
            Reportes en modo demo: conecta{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>DATABASE_URL</code> para ver
            datos reales de tu operacion.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          {[
            { label: "Revenue 12m", value: `$${summary.totalRevenue >= 1000 ? `${(summary.totalRevenue / 1000).toFixed(1)}k` : summary.totalRevenue.toFixed(0)}`, helper: "Facturas no anuladas" },
            { label: "Facturas emitidas", value: String(summary.totalFacturas), helper: "Ultimos 12 meses" },
            { label: "Ticket promedio", value: `$${summary.avgRevenuePerFactura.toLocaleString("en-US")}`, helper: "Por factura" },
            { label: "Mes pico", value: summary.topMes, helper: "Mayor revenue" },
            { label: "Conversion leads", value: `${summary.conversionRate}%`, helper: "Leads → Venta cerrada" },
          ].map((kpi) => (
            <article
              className="p-5"
              key={kpi.label}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
              <p className="mt-3 font-mono text-2xl font-black" style={{ color: "var(--color-gold)" }}>
                {kpi.value}
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>{kpi.helper}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <ChartCard subtitle="Revenue mensual acumulado" title="Ventas por mes (USD)">
            <RevenueChart data={data.monthlyRevenue} />
          </ChartCard>
          <ChartCard subtitle="Documentos emitidos por mes" title="Facturas por mes">
            <FacturasChart data={data.monthlyRevenue} />
          </ChartCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard subtitle="Por revenue generado — ultimos 12 meses" title="Top SKUs">
            <TopSkusChart data={data.topSkus} />
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr style={{ background: "var(--bg-base)" }}>
                    <th className="px-3 py-2 text-left text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>SKU</th>
                    <th className="px-3 py-2 text-left text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Categoria</th>
                    <th className="px-3 py-2 text-right text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Uds</th>
                    <th className="px-3 py-2 text-right text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSkus.map((s, i) => (
                    <tr key={s.sku} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="px-3 py-2">
                        <span className="mr-2 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                        <span className="font-mono font-bold" style={{ color: "var(--color-gold)" }}>{s.sku}</span>
                        <p className="mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.nombre}</p>
                      </td>
                      <td className="px-3 py-2" style={{ color: "var(--text-muted)" }}>{s.categoria}</td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: "var(--text-secondary)" }}>{s.unidades}</td>
                      <td className="px-3 py-2 text-right font-mono font-black" style={{ color: "var(--text-primary)" }}>
                        ${s.revenue.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard subtitle="Distribucion del pipeline CRM" title="Embudo de leads">
            <LeadFunnelChart data={data.leadFunnel} />
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr style={{ background: "var(--bg-base)" }}>
                    <th className="px-3 py-2 text-left text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Etapa</th>
                    <th className="px-3 py-2 text-right text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Leads</th>
                    <th className="px-3 py-2 text-right text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>% del total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const total = data.leadFunnel.reduce((s, l) => s + l.count, 0);
                    return data.leadFunnel.map((l) => (
                      <tr key={l.estado} style={{ borderTop: "1px solid var(--border)" }}>
                        <td className="px-3 py-2 font-bold" style={{ color: "var(--text-secondary)" }}>{l.label}</td>
                        <td className="px-3 py-2 text-right font-mono font-black" style={{ color: "var(--text-primary)" }}>{l.count}</td>
                        <td className="px-3 py-2 text-right font-mono" style={{ color: "var(--text-muted)" }}>
                          {total > 0 ? ((l.count / total) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
          <ChartCard subtitle="Por scoring (0-100)" title="Segmentacion de clientes">
            <ClienteSegmentosChart data={data.clienteSegmentos} />
            <div className="mt-5 grid gap-2">
              {data.clienteSegmentos.map((seg) => (
                <div
                  className="flex items-center justify-between px-4 py-3"
                  key={seg.segmento}
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block size-3 rounded-full" style={{ background: seg.fill }} />
                    <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{seg.segmento}</span>
                  </div>
                  <span className="font-mono font-black" style={{ color: "var(--text-primary)" }}>{seg.count}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard subtitle="Unidades vendidas vs stock actual · linea = rotacion (veces)" title="Rotacion de inventario">
            <InventoryTurnoverChart data={data.inventoryTurnover} />
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr style={{ background: "var(--bg-base)" }}>
                    <th className="px-3 py-2 text-left text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>SKU</th>
                    <th className="px-3 py-2 text-right text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Vendidas</th>
                    <th className="px-3 py-2 text-right text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Stock</th>
                    <th className="px-3 py-2 text-right text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Rotacion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.inventoryTurnover.map((item) => (
                    <tr key={item.sku} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="px-3 py-2">
                        <span className="font-mono font-bold" style={{ color: "var(--color-gold)" }}>{item.sku}</span>
                        <p className="mt-0.5" style={{ color: "var(--text-muted)" }}>{item.nombre}</p>
                      </td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: "var(--text-secondary)" }}>{item.vendidas}</td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: "var(--text-secondary)" }}>{item.stock}</td>
                      <td className="px-3 py-2 text-right font-mono font-black" style={{ color: "var(--color-gold)" }}>{item.rotacion}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </section>
      </section>
    </main>
  );
}
