"use client";

import { useState } from "react";

type Props = {
  imagenes: string[];
  alt: string;
};

/**
 * Storefront image gallery: main image with thumbnail strip below.
 * Renders nothing when imagenes is empty so the caller can show a fallback.
 */
export function ProductGallery({ imagenes, alt }: Props) {
  const [active, setActive] = useState(0);

  if (imagenes.length === 0) return null;

  const safeIndex = Math.min(active, imagenes.length - 1);
  const main = imagenes[safeIndex];

  return (
    <div>
      <div
        className="grid aspect-square place-items-center overflow-hidden"
        style={{ border: "1px solid var(--border)", background: "#1a1a1a" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={alt}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
          }}
        />
      </div>

      {imagenes.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {imagenes.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1} de ${imagenes.length}`}
              aria-pressed={i === safeIndex}
              className="grid aspect-square place-items-center overflow-hidden transition-opacity hover:opacity-100"
              style={{
                border: `1px solid ${i === safeIndex ? "var(--color-gold)" : "var(--border)"}`,
                background: "#1a1a1a",
                opacity: i === safeIndex ? 1 : 0.7,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
