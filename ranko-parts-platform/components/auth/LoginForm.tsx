"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { cn } from "@/lib/utils";

type LoginFormProps = {
  tipo: "equipo" | "cliente";
};

export function LoginForm({ tipo }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError(
        "Credenciales inválidas. Verifica email y contraseña (las contraseñas distinguen mayúsculas y minúsculas).",
      );
      return;
    }

    const fallback = tipo === "cliente" ? "/cliente" : "/admin";
    const callbackUrl = searchParams.get("callbackUrl");
    const destination =
      callbackUrl && callbackUrl.startsWith(tipo === "cliente" ? "/cliente" : "/admin")
        ? callbackUrl
        : fallback;

    router.push(destination);
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  };

  // Demo credentials shown inline so anyone can test the platform without
  // hunting for them in the docs. Hidden via DISABLE_DEMO_LOGIN env on real
  // production. We always render the hint — the actual auth check on the
  // server is what decides whether the credentials are honored.
  const demoCredentials =
    tipo === "cliente"
      ? { email: "cliente@rankoparts.com", password: "RankoCliente2026!" }
      : { email: "admin@rankoparts.com", password: "RankoAdmin2026!" };

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
        Email
        <input
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          className="h-12 rounded-sm px-3 outline-none transition"
          inputMode="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
          spellCheck={false}
          style={inputStyle}
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
        Contraseña
        <div className="relative">
          <input
            autoCapitalize="none"
            autoComplete="current-password"
            autoCorrect="off"
            className="h-12 w-full rounded-sm px-3 pr-12 outline-none transition"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mín. 8 caracteres"
            required
            spellCheck={false}
            style={inputStyle}
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded transition hover:opacity-100"
            style={{ color: "var(--text-muted)", opacity: 0.75 }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 px-3 py-2 text-sm font-bold"
          style={{
            border: "1px solid var(--color-danger)",
            background: "color-mix(in srgb, var(--color-danger) 8%, transparent)",
            color: "var(--color-danger)",
          }}
        >
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      ) : null}

      <button
        className={cn(
          "group inline-flex h-12 items-center justify-center gap-2 rounded-sm px-4 text-sm font-black uppercase tracking-wider text-black shadow-[0_8px_24px_-8px_rgba(245,197,24,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(245,197,24,0.8)]",
          isLoading && "cursor-wait opacity-70",
        )}
        disabled={isLoading}
        style={{ background: "var(--color-gold)" }}
        type="submit"
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </button>

      {/* Demo credentials helper — click to autofill */}
      <button
        type="button"
        onClick={() => {
          setEmail(demoCredentials.email);
          setPassword(demoCredentials.password);
          setError("");
        }}
        className="mt-1 rounded border border-dashed px-3 py-2 text-left text-[11px] transition hover:border-[var(--color-gold)]"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-elevated)",
          color: "var(--text-muted)",
        }}
      >
        <span className="block font-mono-tech text-[10px]" style={{ color: "var(--color-gold)" }}>
          ▸ Demo · click para autocompletar
        </span>
        <span className="mt-1 block font-mono text-[11px]">
          {demoCredentials.email}
        </span>
        <span className="block font-mono text-[11px]">{demoCredentials.password}</span>
      </button>
    </form>
  );
}
