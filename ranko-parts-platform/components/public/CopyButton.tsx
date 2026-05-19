"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      aria-label={copied ? "Copiado" : "Copiar codigo"}
      onClick={handleCopy}
      className="inline-flex size-12 items-center justify-center transition hover:opacity-80"
      style={{
        border: `1px solid ${copied ? "var(--color-success)" : "var(--border)"}`,
        background: copied ? "color-mix(in srgb, var(--color-success) 12%, var(--bg-elevated))" : "var(--bg-elevated)",
        color: copied ? "var(--color-success)" : "var(--text-muted)",
      }}
      type="button"
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
    </button>
  );
}
