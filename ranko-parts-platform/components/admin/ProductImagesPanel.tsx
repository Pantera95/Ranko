"use client";

import { Image as ImageIcon, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productoId: string;
  initial: string[];
};

const MAX_IMAGES = 12;
const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 6,
};

export default function ProductImagesPanel({ productoId, initial }: Props) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function addUrl(e?: React.FormEvent) {
    e?.preventDefault();
    const url = newUrl.trim();
    if (!url) return;
    if (!/^https?:\/\/\S+$/i.test(url)) {
      setError("La URL debe empezar con http:// o https://");
      return;
    }
    if (images.includes(url)) {
      setError("Esa imagen ya está en la lista");
      return;
    }
    if (images.length >= MAX_IMAGES) {
      setError(`Máximo ${MAX_IMAGES} imágenes por producto`);
      return;
    }
    setImages((prev) => [...prev, url]);
    setNewUrl("");
    setError(null);
    setDirty(true);
    setSaved(false);
  }

  function removeAt(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
    setSaved(false);
    setError(null);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/productos/${productoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagenes: images }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "No se pudo guardar");
        return;
      }
      setDirty(false);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      <div
        className="flex items-center justify-between gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center gap-2">
          <ImageIcon size={13} style={{ color: "var(--color-gold)" }} />
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
            Imágenes ({images.length}/{MAX_IMAGES})
          </p>
        </div>
        {dirty && (
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-black uppercase disabled:opacity-50"
            style={{ background: "var(--color-gold)", color: "#000" }}
          >
            {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
            Guardar
          </button>
        )}
        {saved && !dirty && (
          <span className="text-[10px] font-black uppercase" style={{ color: "var(--color-success)" }}>
            ✓ Guardado
          </span>
        )}
      </div>

      {/* Add URL form */}
      <form onSubmit={addUrl} className="flex gap-2 border-b px-5 py-3" style={{ borderColor: "var(--border-subtle)" }}>
        <input
          type="url"
          value={newUrl}
          onChange={(e) => { setNewUrl(e.target.value); setError(null); }}
          placeholder="https://cdn.tuservidor.com/producto.jpg"
          className="flex-1 rounded px-3 py-2 text-sm"
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={!newUrl.trim() || images.length >= MAX_IMAGES}
          className="inline-flex shrink-0 items-center gap-1 rounded px-3 py-2 text-xs font-black uppercase disabled:opacity-40"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <Plus size={11} /> Añadir
        </button>
      </form>

      {error && (
        <p className="border-b px-5 py-2 text-xs font-bold" style={{ borderColor: "var(--border-subtle)", color: "var(--color-danger)" }}>
          {error}
        </p>
      )}

      {/* Image list */}
      {images.length === 0 ? (
        <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>
          Sin imágenes. Pega URLs de tu CDN o almacenamiento de imágenes.
        </p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {images.map((url, idx) => (
            <li key={`${url}-${idx}`} className="group flex items-center gap-3 px-5 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Imagen ${idx + 1}`}
                className="size-12 shrink-0 rounded object-cover"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{url}</p>
                {idx === 0 && (
                  <p className="mt-0.5 text-[10px] font-black uppercase" style={{ color: "var(--color-gold)" }}>
                    Imagen principal
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded p-1 text-xs font-mono disabled:opacity-30"
                  style={{ color: "var(--text-muted)" }}
                  title="Subir"
                  aria-label="Mover arriba"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === images.length - 1}
                  className="rounded p-1 text-xs font-mono disabled:opacity-30"
                  style={{ color: "var(--text-muted)" }}
                  title="Bajar"
                  aria-label="Mover abajo"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="rounded p-1 opacity-0 group-hover:opacity-100"
                  style={{ color: "var(--color-danger)" }}
                  title="Eliminar"
                  aria-label="Eliminar imagen"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
