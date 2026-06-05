import { Building2, Clock3, CreditCard, History, Wrench } from "lucide-react";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { B2BLeadForm } from "@/components/public/B2BLeadForm";

const beneficios = [
  { icon: Building2, text: "Precios por volumen para talleres y distribuidores" },
  { icon: CreditCard, text: "Crédito comercial con límite y seguimiento de cartera" },
  { icon: Clock3, text: "Atención prioritaria para pedidos operativos" },
  { icon: History, text: "Historial de compras, facturas y cotizaciones" },
];

export default function B2BPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <PublicNavbar />
      <section className="relative overflow-hidden">
        {/* industrial backdrop — same language as home hero */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,197,24,0.06)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.05)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50"
        />
        <div
          aria-hidden="true"
          className="absolute -right-32 top-1/2 hidden h-[480px] w-[480px] -translate-y-1/2 lg:block"
          style={{ background: "radial-gradient(circle at center, rgba(245,197,24,0.18), transparent 65%)" }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
              <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
              <Wrench size={12} /> Ranko Parts B2B
            </p>
            <h1 className="font-display-kinetic--tight mt-4 max-w-3xl break-words text-3xl uppercase leading-[1.05] tracking-normal sm:text-4xl md:text-5xl lg:text-6xl">
              Suministro serio para talleres y distribuidores.
            </h1>
            <p className="mt-6 max-w-2xl leading-8" style={{ color: "var(--text-secondary)" }}>
              Solicita acceso comercial para precios por volumen, crédito operativo y seguimiento
              de facturas desde el portal.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {beneficios.map((beneficio, i) => (
                <article
                  key={beneficio.text}
                  className="group relative overflow-hidden p-6 transition-all hover:-translate-y-0.5"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-4 font-mono text-6xl font-black opacity-5 transition-opacity group-hover:opacity-10"
                    style={{ color: "var(--color-gold)" }}
                  >
                    0{i + 1}
                  </span>
                  <div
                    className="flex size-11 items-center justify-center"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <beneficio.icon size={20} style={{ color: "var(--color-gold)" }} />
                  </div>
                  <p className="relative mt-4 leading-7 font-bold">{beneficio.text}</p>
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ background: "var(--color-gold)" }}
                  />
                </article>
              ))}
            </div>
          </div>
          <B2BLeadForm />
        </div>
      </section>
      <WhatsAppFloating />
    </main>
  );
}
