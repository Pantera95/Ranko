"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { cn } from "@/lib/utils";

type LoginFormProps = {
  tipo: "equipo" | "cliente";
};

export function LoginForm({ tipo }: LoginFormProps) {
  const router = useRouter();
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

    router.push(tipo === "cliente" ? "/cliente" : "/admin");
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
        <p className="text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>
      ) : null}
      <button
        className={cn(
          "h-11 px-4 text-sm font-bold uppercase text-black transition hover:opacity-90",
          isLoading && "cursor-wait opacity-70",
        )}
        disabled={isLoading}
        style={{ background: "var(--color-gold)" }}
        type="submit"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
