import { SolicitarResetForm } from "@/components/auth/SolicitarResetForm";

export const metadata = {
  title: "Recuperar contraseña — Portal Ranko Parts",
};

export default function RecuperarPasswordPage() {
  return (
    <main
      className="relative grid min-h-screen place-items-center px-6 py-12"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,197,24,0.05)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.05)_1px,transparent_1px)] bg-[size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,197,24,0.12),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(245,197,24,0.08),transparent_60%)]"
      />

      <section
        className="relative w-full max-w-md overflow-hidden p-8 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.5)]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
        <div aria-hidden="true" className="absolute -left-px top-6 h-10 w-1 bg-[var(--color-gold)]" />

        <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
          <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
          Portal Ranko Parts
        </p>
        <h1 className="font-display-kinetic--tight mt-4 text-3xl uppercase leading-tight">Recuperar acceso</h1>
        <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Tu vendedor recibirá la solicitud y te entregará una nueva contraseña por un canal seguro.
        </p>
        <div className="mt-8">
          <SolicitarResetForm />
        </div>
      </section>
    </main>
  );
}
