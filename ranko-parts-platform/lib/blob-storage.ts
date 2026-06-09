import "server-only";

import { put, del, list } from "@vercel/blob";

/**
 * Wrapper sobre Vercel Blob para uploads del módulo BI Reportes.
 *
 * El token BLOB_READ_WRITE_TOKEN se inyecta automáticamente cuando habilitas
 * Blob storage en el dashboard de Vercel — no hace falta hardcodearlo.
 *
 * Las URLs públicas que devuelve son CDN-cached y firmadas; los archivos
 * no son listables por web. Cada uno tiene su propio sufijo único.
 */

export type UploadedBlob = {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
};

/**
 * Sube un archivo al bucket `reportes-bi/` del Blob store.
 * El pathname final incluye un hash aleatorio para evitar colisiones.
 */
export async function uploadReportBlob(
  file: File,
  options: { tipo: string; uploaderId: string },
): Promise<UploadedBlob> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `reportes-bi/${options.tipo.toLowerCase()}/${options.uploaderId}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: file.type || "application/octet-stream",
    size: file.size,
  };
}

/** Elimina un blob por URL completa o pathname. */
export async function deleteReportBlob(urlOrPathname: string): Promise<void> {
  try {
    await del(urlOrPathname);
  } catch (err) {
    // No-throw: blob ya no existe o credentials no disponibles
    console.warn("[blob] delete failed:", err);
  }
}

/** Lista los blobs subidos por un usuario (debug / cleanup). */
export async function listUserBlobs(uploaderId: string) {
  const result = await list({ prefix: `reportes-bi/${uploaderId}/` });
  return result.blobs;
}
