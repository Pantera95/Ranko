import { Building2, Clock3, CreditCard, History } from "lucide-react";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { B2BLeadForm } from "@/components/public/B2BLeadForm";

const beneficios = [
  { icon: Building2, text: "Precios por volumen para talleres y distribuidores" },
  { icon: CreditCard, text: "Credito comercial con limite y seguimiento de cartera" },
  { icon: Clock3, text: "Atencion prioritaria para pedidos operativos" },
  { icon: History, text: "Historial de compras, facturas y cotizaciones" },
];

export default function B2BPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <PublicNavbar />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
            Ranko Parts B2B
          </p>
          <h1 className="mt-3 max-w-3xl text-6xl font-black uppercase leading-none">
            Suministro serio para talleres y distribuidores.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8" style={{ color: "var(--text-secondary)" }}>
            Solicita acceso comercial para precios por volumen, credito operativo y seguimiento
            de facturas desde el portal.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {beneficios.map((beneficio) => (
              <article
                key={beneficio.text}
                className="p-6"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <beneficio.icon size={28} style={{ color: "var(--color-gold)" }} />
                <p className="mt-4 text-lg font-bold">{beneficio.text}</p>
              </article>
            ))}
          </div>
        </div>
        <B2BLeadForm />
      </section>
      <WhatsAppFloating />
    </main>
  );
}
