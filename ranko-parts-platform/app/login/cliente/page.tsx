import { LoginForm } from "@/components/auth/LoginForm";

export default function ClienteLoginPage() {
  return (
    <main
      className="grid min-h-screen place-items-center px-6 py-12"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <section
        className="w-full max-w-md p-8"
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
          Portal Ranko Parts
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase">Acceso de cliente</h1>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Historial de pedidos, facturas, cotizaciones, vehiculos y referidos.
        </p>
        <div className="mt-8">
          <LoginForm tipo="cliente" />
        </div>
      </section>
    </main>
  );
}
