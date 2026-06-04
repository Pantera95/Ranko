import { Gift, Share2, Star, Users } from "lucide-react";
import Link from "next/link";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";

const pasos = [
  {
    icon: Share2,
    titulo: "Refiere un negocio",
    descripcion: "Comparte el enlace de Ranko Parts con un taller, distribuidor o empresa.",
  },
  {
    icon: Users,
    titulo: "El equipo lo contacta",
    descripcion: "Nuestro equipo comercial gestiona al referido y activa su cuenta.",
  },
  {
    icon: Gift,
    titulo: "Tu ganas credito",
    descripcion: "Acumulas credito o descuentos configurados desde el panel interno.",
  },
];

export default function ReferidosPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <PublicNavbar />

      {/* Hero */}
      <section
        className="border-b px-4 py-20 sm:px-6 lg:px-8"
        style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
      >
        <div className="mx-auto max-w-5xl">
          <div
            className="inline-flex items-center gap-2 border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]"
            style={{ borderColor: "var(--color-gold)", color: "var(--color-gold)" }}
          >
            <Star size={12} /> Programa de referidos
          </div>
          <h1 className="font-display-kinetic--tight mt-5 text-5xl uppercase leading-[1.02] sm:text-6xl lg:text-7xl">
            Refiere y <span style={{ color: "var(--color-gold)" }}>gana.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl font-semibold leading-9" style={{ color: "var(--text-secondary)" }}>
            Clientes activos pueden referir talleres, empresas y distribuidores para ganar credito
            comercial o descuentos configurados desde el panel interno.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-black uppercase text-black transition hover:opacity-90"
              href="https://wa.me/584147903498?text=Quiero%20saber%20m%C3%A1s%20del%20programa%20de%20referidos"
              rel="noreferrer"
              style={{ background: "var(--color-gold)" }}
              target="_blank"
            >
              Comenzar a referir
            </a>
            <Link
              href="/cliente"
              className="inline-flex h-12 items-center justify-center px-6 text-sm font-black uppercase transition"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              Ver mi portal
            </Link>
          </div>
        </div>
      </section>

      {/* Pasos */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
            <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
            Cómo funciona
          </p>
          <h2 className="font-display-kinetic mt-3 text-3xl uppercase leading-tight sm:text-4xl">3 pasos simples</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pasos.map((paso, i) => (
              <article
                key={paso.titulo}
                className="relative p-6"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <span
                  className="absolute -top-4 left-5 flex h-8 w-8 items-center justify-center font-mono text-sm font-black"
                  style={{ background: "var(--color-gold)", color: "#000" }}
                >
                  {i + 1}
                </span>
                <paso.icon size={28} className="mt-2" style={{ color: "var(--color-gold)" }} />
                <h3 className="mt-4 text-lg font-black uppercase">{paso.titulo}</h3>
                <p className="mt-2 leading-7" style={{ color: "var(--text-secondary)" }}>
                  {paso.descripcion}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-4 py-16 sm:px-6 lg:px-8"
        style={{ background: "var(--color-gold)" }}
      >
        <div className="mx-auto max-w-5xl text-center text-black">
          <h2 className="font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">¿Listo para referir?</h2>
          <p className="mt-4 text-lg font-semibold">
            Escríbenos por WhatsApp y te explicamos los beneficios actuales del programa.
          </p>
          <a
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 px-8 text-sm font-black uppercase text-black transition hover:opacity-90"
            style={{ background: "var(--color-gold)" }}
            href="https://wa.me/584147903498?text=Quiero%20saber%20m%C3%A1s%20del%20programa%20de%20referidos"
            rel="noreferrer"
            target="_blank"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </section>

      <WhatsAppFloating />
    </main>
  );
}
