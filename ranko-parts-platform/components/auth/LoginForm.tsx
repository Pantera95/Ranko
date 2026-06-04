"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Credenciales invalidas o usuario inactivo.");
      return;
    }

    const fallback = tipo === "cliente" ? "/cliente" : "/admin";
    const callbackUrl = searchParams.get("callbackUrl");
    // Only honour callbackUrl if it belongs to the same portal (security guard)
    const destination =
      callbackUrl && callbackUrl.startsWith(tipo === "cliente" ? "/cliente" : "/admin")
        ? callbackUrl
        : fallback;

    router.push(destination);
    router.refresh();
  }

  const inputStyle = {
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
        Email
        <input
          autoComplete="email"
          className="h-11 px-3 outline-none transition focus:ring-1"
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
        Password
        <input
          autoComplete="current-password"
          className="h-11 px-3 outline-none transition focus:ring-1"
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
          type="password"
          value={password}
        />
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
        {isLoading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
