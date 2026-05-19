import { notFound } from "next/navigation";

const sections: Record<
  string,
  {
    title: string;
    eyebrow: string;
    description: string;
    metrics: string[];
  }
> = {
  crm: {
    title: "CRM / Pipeline",
    eyebrow: "Ventas",
    description: "Pipeline visual para leads, cotizaciones, seguimiento y recompras.",
    metrics: ["Leads nuevos", "Cotizados", "Cierre pendiente"],
  },
  clientes: {
    title: "Clientes",
    eyebrow: "Base comercial",
    description: "Ficha 360, vehiculos, historial, deuda y segmentacion por tipo de cliente.",
    metrics: ["Minoristas", "Talleres", "Distribuidores"],
  },
  cotizaciones: {
    title: "Cotizaciones",
    eyebrow: "Preventa",
    description: "Generador de cotizaciones con listas de precio y aprobaciones por rol.",
    metrics: ["Borradores", "Enviadas", "Aceptadas"],
  },
  facturacion: {
    title: "Facturacion",
    eyebrow: "Billing",
    description: "Facturas, PDFs, saldos, logs y conversion desde cotizaciones aprobadas.",
    metrics: ["Pendientes", "Pagadas", "Vencidas"],
  },
  deudas: {
    title: "Panel de deudas",
    eyebrow: "Cartera",
    description: "Antiguedad de saldos, bloqueo comercial y recordatorios por WhatsApp.",
    metrics: ["0-30 dias", "31-60 dias", "+90 dias"],
  },
  pagos: {
    title: "Pagos",
    eyebrow: "Cobranza",
    description: "Registro manual, verificacion, comprobantes y conciliacion operativa.",
    metrics: ["Pendientes", "Confirmados", "Rechazados"],
  },
  alertas: {
    title: "Alertas anomalas",
    eyebrow: "Riesgo",
    description: "Deteccion de pagos duplicados, descuentos fuera de rango y patrones inusuales.",
    metrics: ["Criticas", "Altas", "Medias"],
  },
  catalogo: {
    title: "Catalogo",
    eyebrow: "Productos",
    description: "SKUs, marcas, precios, compatibilidades y productos destacados.",
    metrics: ["Activos", "Destacados", "Sin stock"],
  },
  inventario: {
    title: "Inventario",
    eyebrow: "Almacenes",
    description: "Stock por almacen, minimos, maximos, ubicaciones y clasificacion ABC.",
    metrics: ["Caracas", "Lecheria", "Reorden"],
  },
  ordenes: {
    title: "Ordenes",
    eyebrow: "Despacho",
    description: "Preparacion, estados publicos de tracking y responsable operativo.",
    metrics: ["Confirmadas", "En camino", "Entregadas"],
  },
  ecommerce: {
    title: "E-Commerce",
    eyebrow: "Tienda",
    description: "Catalogo publico, filtros, checkout operativo y pedidos web.",
    metrics: ["Visitas", "Carritos", "Pedidos"],
  },
  reportes: {
    title: "Reportes / BI",
    eyebrow: "Inteligencia",
    description: "Ventas, margen, cartera, rotacion, conversion y forecast comercial.",
    metrics: ["Ventas", "Margen", "Forecast"],
  },
  automatizacion: {
    title: "Automatizacion",
    eyebrow: "Omnicanal",
    description: "Secuencias WhatsApp/Email para leads, cotizaciones, recompra y deudas.",
    metrics: ["Activas", "Enviados", "Respuestas"],
  },
  referidos: {
    title: "Referidos",
    eyebrow: "Crecimiento",
    description: "Codigos, empresas referidas, activacion y beneficios comerciales.",
    metrics: ["Pendientes", "Activos", "Beneficios"],
  },
  usuarios: {
    title: "Usuarios",
    eyebrow: "Sistema",
    description: "Roles, permisos, territorios, usuarios internos y accesos de clientes.",
    metrics: ["Equipo", "Clientes", "Inactivos"],
  },
  logs: {
    title: "Logs auditoria",
    eyebrow: "Master Admin",
    description: "Bitacora inmutable de facturacion, pagos, descuentos y cambios sensibles.",
    metrics: ["Hoy", "Criticos", "Exportables"],
  },
  configuracion: {
    title: "Configuracion",
    eyebrow: "Sistema",
    description: "Politicas comerciales, metas, umbrales de deuda, impuestos y canales.",
    metrics: ["Metas", "Umbrales", "Canales"],
  },
};

type AdminSectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function AdminSectionPage({ params }: AdminSectionPageProps) {
  const { section } = await params;
  const data = sections[section];

  if (!data) {
    notFound();
  }

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">
          {data.eyebrow}
        </p>
        <h2 className="mt-3 text-4xl font-black uppercase">{data.title}</h2>
        <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>{data.description}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {data.metrics.map((metric) => (
            <article
              key={metric}
              className="p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{metric}</p>
              <p className="mt-3 font-mono text-3xl font-black">0</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
