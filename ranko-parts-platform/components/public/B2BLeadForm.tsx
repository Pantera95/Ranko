"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send, XCircle } from "lucide-react";

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string; whatsapp?: string };

export function B2BLeadForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle", message: "" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setState({ status: "loading", message: "Enviando solicitud..." });
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, canal: "B2B" }),
    });
    const result = await response.json();
    if (!response.ok) {
      setState({ status: "error", message: result.error ?? "No pudimos enviar la solicitud.", whatsapp: result.whatsapp });
      return;
    }
    form.reset();
    setState({ status: "success", message: "Solicitud recibida. El equipo comercial puede tomarla desde el CRM." });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 p-5"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      <input aria-hidden="true" className="hidden" name="website" tabIndex={-1} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" name="nombre" required />
        <Field label="Empresa" name="empresa" />
        <label className="grid gap-2 text-sm font-bold uppercase" style={{ color: "var(--text-muted)" }}>
          Tipo de cuenta
          <select
            name="tipo"
            defaultValue="TALLER"
            className="h-11 px-3 outline-none transition"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          >
            <option value="TALLER">Taller</option>
            <option value="DISTRIBUIDOR_LOCAL">Distribuidor local</option>
            <option value="DISTRIBUIDOR_REGIONAL">Distribuidor regional</option>
            <option value="MINORISTA">Minorista</option>
            <option value="VIP">VIP</option>
          </select>
        </label>
        <Field label="Ciudad" name="ciudad" />
        <Field label="Telefono" name="telefono" required />
        <Field label="WhatsApp" name="whatsapp" />
        <Field label="Email" name="email" type="email" />
        <Field label="Marca vehiculo" name="vehiculoMarca" />
        <Field label="Modelo vehiculo" name="vehiculoModelo" />
        <Field label="Ano" name="vehiculoAnio" />
      </div>
      <label className="grid gap-2 text-sm font-bold uppercase" style={{ color: "var(--text-muted)" }}>
        Que necesitas
        <textarea
          className="min-h-28 px-3 py-3 outline-none transition"
          maxLength={600}
          name="interes"
          placeholder="Ej: cotizacion mensual de aceites Liqui-Moly, filtros K&N y frenos Mopar"
          required
          style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
        />
      </label>
      <button
        className="inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-black uppercase text-black transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
        disabled={state.status === "loading"}
        style={{ background: "var(--color-gold)" }}
      >
        <Send size={18} /> {state.status === "loading" ? "Enviando..." : "Solicitar cuenta B2B"}
      </button>
      {state.status === "success" && (
        <div
          className="flex gap-3 p-4 text-sm"
          style={{ border: "1px solid var(--color-success)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
        >
          <CheckCircle2 className="shrink-0" size={20} style={{ color: "var(--color-success)" }} />
          {state.message}
        </div>
      )}
      {state.status === "error" && (
        <div
          className="grid gap-3 p-4 text-sm"
          style={{ border: "1px solid var(--color-danger)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
        >
          <p className="flex gap-3">
            <XCircle className="shrink-0" size={20} style={{ color: "var(--color-danger)" }} />
            {state.message}
          </p>
          {state.whatsapp && (
            <a
              className="inline-flex h-10 items-center justify-center px-4 font-black uppercase text-white"
              href={state.whatsapp}
              rel="noreferrer"
              style={{ background: "#25D366" }}
              target="_blank"
            >
              Enviar por WhatsApp
            </a>
          )}
        </div>
      )}
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold uppercase" style={{ color: "var(--text-muted)" }}>
      {label}
      <input
        className="h-11 px-3 outline-none transition"
        name={name}
        required={required}
        type={type}
        style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
      />
    </label>
  );
}
