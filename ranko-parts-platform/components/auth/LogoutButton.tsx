"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="mt-3 w-full rounded px-3 py-2 text-left text-xs font-bold uppercase transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
      type="button"
    >
      Cerrar sesion
    </button>
  );
}
