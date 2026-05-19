import { Car, CreditCard, MapPin, Phone, User } from "lucide-react";

import { auth } from "@/auth";
import { CopyButton } from "@/components/public/CopyButton";
import { getClientePerfil } from "@/lib/client-sections";
import { cn } from "@/lib/utils";

const TIPO_LABELS: Record<string, string> = {
  MINORISTA: "Minorista",
  TALLER: "Taller",
  DISTRIBUIDOR_LOCAL: "Distribuidor Local",
  DISTRIBUIDOR_REGIONAL: "Distribuidor Regional",
  VIP: "VIP",
};

const TEMP_COLORS: Record<string, string> = {
  CALIENTE: "bg-red-100 text-red-700",
  TIBIO: "bg-amber-100 text-amber-700",
  FRIO: "bg-blue-100 text-blue-700",
};

export default async function ClientePerfilPage() {
  const session = await auth();
  const perfil = await getClientePerfil(session?.user?.id);

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
          Portal del cliente
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase">Mi perfil</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Datos comerciales registrados en Ranko Parts.
        </p>

        {perfil.isFallback ? (
          <div
            className="mt-6 p-4 text-sm"
            style={{
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            Portal en modo demo hasta conectar la base de datos.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Datos personales / empresa */}
          <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <User size={18} style={{ color: "var(--text-muted)" }} />
              <h2 className="font-black uppercase">Datos de cuenta</h2>
            </div>
            <div>
              <Row label="Nombre" value={perfil.nombre} />
              {perfil.empresa ? <Row label="Empresa" value={perfil.empresa} /> : null}
              <Row
                label="Tipo de cliente"
                value={TIPO_LABELS[perfil.tipo] ?? perfil.tipo}
              />
              {perfil.rif ? <Row label="RIF" value={perfil.rif} mono /> : null}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Temperatura</p>
                <span
                  className={cn(
                    "rounded px-2 py-1 text-[10px] font-black uppercase",
                    TEMP_COLORS[perfil.temperatura] ?? "bg-zinc-100 text-zinc-600",
                  )}
                >
                  {perfil.temperatura.charAt(0) + perfil.temperatura.slice(1).toLowerCase()}
                </span>
              </div>
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Scoring</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-20 rounded-full"
                    style={{ background: "var(--bg-elevated)" }}
                  >
                    <div
                      className={cn(
                        "h-1.5 rounded-full",
                        perfil.scoring >= 75
                          ? "bg-green-500"
                          : perfil.scoring >= 50
                          ? "bg-amber-400"
                          : "bg-red-500",
                      )}
                      style={{ width: `${perfil.scoring}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm font-black" style={{ color: "var(--text-secondary)" }}>
                    {perfil.scoring}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <Phone size={18} style={{ color: "var(--text-muted)" }} />
              <h2 className="font-black uppercase">Contacto</h2>
            </div>
            <div>
              <Row label="Telefono" value={perfil.telefono} mono />
              {perfil.whatsapp ? <Row label="WhatsApp" value={perfil.whatsapp} mono /> : null}
              {perfil.email ? <Row label="Email" value={perfil.email} /> : null}
            </div>

            <div
              className="flex items-center gap-3 px-5 py-4 mt-2"
              style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
            >
              <MapPin size={18} style={{ color: "var(--text-muted)" }} />
              <h2 className="font-black uppercase">Ubicacion</h2>
            </div>
            <div>
              {perfil.ciudad ? <Row label="Ciudad" value={perfil.ciudad} /> : null}
              <Row label="Pais" value={perfil.pais} />
              {perfil.direccion ? <Row label="Direccion" value={perfil.direccion} /> : null}
            </div>
          </section>

          {/* Condiciones comerciales */}
          <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <CreditCard size={18} style={{ color: "var(--text-muted)" }} />
              <h2 className="font-black uppercase">Condicion comercial</h2>
            </div>
            <div>
              <Row label="Condicion de pago" value={perfil.condicionPago} />
              <Row label="Limite de credito" value={perfil.limiteCredito} mono />
              {perfil.codigoReferido ? (
                <div
                  className="px-5 py-4"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Codigo de referido</p>
                  <div className="mt-2 flex items-center gap-3">
                    <p
                      className="flex-1 px-4 py-3 font-mono text-xl font-black"
                      style={{
                        border: "1px dashed var(--border)",
                        background: "var(--bg-elevated)",
                      }}
                    >
                      {perfil.codigoReferido}
                    </p>
                    <CopyButton text={perfil.codigoReferido} />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* Vehículos */}
          <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <Car size={18} style={{ color: "var(--text-muted)" }} />
              <h2 className="font-black uppercase">
                Mis vehiculos ({perfil.vehiculos.length})
              </h2>
            </div>
            {perfil.vehiculos.length ? (
              <div>
                {perfil.vehiculos.map((v) => (
                  <div
                    className="px-5 py-4"
                    key={v.id}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <p className="font-black uppercase">{v.marca} {v.modelo} {v.anio}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {v.motor ? <span>Motor: {v.motor}</span> : null}
                      {v.color ? <span>Color: {v.color}</span> : null}
                      {v.placa ? <span className="font-mono">Placa: {v.placa}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm" style={{ color: "var(--text-muted)" }}>Sin vehiculos registrados.</p>
            )}
          </section>
        </div>

        <p className="mt-8 text-xs" style={{ color: "var(--text-muted)" }}>
          Para actualizar tus datos contacta a tu vendedor por WhatsApp.
        </p>
      </section>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <p className="shrink-0 text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p
        className={cn("text-right text-sm", mono && "font-mono font-bold")}
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
