"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="hidden items-center gap-2 px-4 py-2 text-xs font-black uppercase transition hover:opacity-80 sm:inline-flex print:hidden"
      style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
    >
      <Printer size={13} /> Imprimir
    </button>
  );
}
