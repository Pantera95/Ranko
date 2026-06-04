"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  clienteId: string;
  interaccionId: string;
};

export function InteraccionRowActions({ clienteId, interaccionId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta interacción del historial? Esta acción no se puede deshacer.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/clientes/${clienteId}/interacciones/${interaccionId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      title="Eliminar interacción"
      aria-label="Eliminar interacción"
      className="rounded p-1 opacity-0 transition-opacity hover:bg-[var(--bg-elevated)] group-hover:opacity-100 disabled:opacity-50"
      style={{ color: "var(--color-danger)" }}
    >
      {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
    </button>
  );
}
