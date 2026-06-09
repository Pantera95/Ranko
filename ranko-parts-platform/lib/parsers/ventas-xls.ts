import "server-only";

import * as XLSX from "xlsx";

/**
 * Parser para reportes de ventas en formato XLS/XLSX (típicamente exportados
 * desde sistemas ERP / Crystal Reports). El formato detectado en los archivos
 * de Ranko Parts tiene esta estructura:
 *
 *   Header (row 0):
 *     Número | Reng | Emisión | Cliente | Vendedor | Almacén |
 *     Cantidad | Unid. | Precio Unitario | Desc. % | Neto
 *
 *   Cuerpo agrupado por SKU:
 *     [SKU header row]  → col 0 = código SKU alfanumérico (ej. "007GE"),
 *                          col 2 = nombre del producto en texto
 *     [Data rows]       → col 0 = número de documento (numérico, posiblemente
 *                          con "*" si fue anulado), col 2 = fecha (serial Excel),
 *                          cols 3-10 = datos de la transacción
 *     [Subtotal row]    → col 0 = "Sub-Totales:" → ignorar
 *
 *   Anuladas: número de documento termina en "*" o columna Almacén contiene
 *   "*ANULADO*" → se guardan con anulada=true para conservar trazabilidad
 *   pero NO entran en cálculos de revenue / margen.
 *
 * El parser es defensivo: si una fila no cumple el patrón data-row la salta
 * silenciosamente sin abortar el archivo entero.
 */

export type VentaParsed = {
  numero: string | null;
  fecha: Date;
  sku: string | null;
  producto: string | null;
  cliente: string | null;
  vendedor: string | null;
  almacen: string | null;
  cantidad: number;
  unidad: string | null;
  precioUnitario: number;
  descuentoPct: number;
  neto: number;
  anulada: boolean;
};

export type ParseVentasResult = {
  ventas: VentaParsed[];
  filasParseadas: number;
  filasAnuladas: number;
  filasSaltadas: number;
  periodoInicio: Date | null;
  periodoFin: Date | null;
  encabezadoDetectado: boolean;
  metadata: {
    columnas: string[];
    skusUnicos: number;
    clientesUnicos: number;
  };
};

/**
 * Convierte serial Excel (días desde 1900-01-01 con bug de 1900-leap) a Date UTC.
 * Numbers > 60 son post-1900-feb-29 (un día imaginario en Excel) — restamos 1
 * para corregir. Maneja también la parte fraccional (horas/minutos).
 */
export function excelSerialToDate(serial: number): Date {
  if (!Number.isFinite(serial) || serial < 1) {
    return new Date(NaN);
  }
  // Excel epoch base, ajustando el bug del año bisiesto inexistente 1900
  const utcDays = Math.floor(serial - 25569);
  const utcMillis = utcDays * 86400 * 1000;
  const fractional = serial - Math.floor(serial);
  const fractionalMillis = Math.round(fractional * 86400 * 1000);
  return new Date(utcMillis + fractionalMillis);
}

/** Parsea un buffer XLS/XLSX y devuelve filas estructuradas + metadata. */
export function parseVentasXLS(buffer: Buffer | ArrayBuffer | Uint8Array): ParseVentasResult {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
  });

  if (!rows.length) {
    return emptyResult();
  }

  // Detectar columnas de la primera fila
  const headers = rows[0]?.map((h) => String(h ?? "").trim()) ?? [];
  const encabezadoDetectado = headers.some((h) => /numer|emision|cliente|neto/i.test(h));

  const ventas: VentaParsed[] = [];
  let filasAnuladas = 0;
  let filasSaltadas = 0;
  let currentSku: string | null = null;
  let currentProducto: string | null = null;
  let periodoInicio: Date | null = null;
  let periodoFin: Date | null = null;
  const skus = new Set<string>();
  const clientes = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === null || c === "")) continue;

    const col0 = stringify(row[0]);
    const col2 = stringify(row[2]);
    const col5 = stringify(row[5]);

    // Section header: col 0 es código alfanumérico, col 1 vacío, col 2 tiene texto
    if (col0 && !col0.startsWith("Sub-Totales") && !isNumericLike(col0) && col2) {
      currentSku = col0;
      currentProducto = col2;
      continue;
    }

    // Subtotal row → skip
    if (col0.startsWith("Sub-Totales")) continue;

    // Data row: col 0 es numérico (o con *), col 2 es serial de Excel, col 10 es Neto
    const numero = col0.replace(/\s*\*\s*$/, "").trim();
    const esAnulada =
      col0.endsWith("*") ||
      /ANULAD/i.test(col5) ||
      Number(row[10]) === 0 && Number(row[6]) === 0;

    const fechaSerial = Number(row[2]);
    if (!Number.isFinite(fechaSerial) || fechaSerial < 1) {
      filasSaltadas++;
      continue;
    }

    const fecha = excelSerialToDate(fechaSerial);
    if (isNaN(fecha.getTime())) {
      filasSaltadas++;
      continue;
    }

    const cantidad = parseDecimal(row[6]);
    const precioUnitario = parseDecimal(row[8]);
    const neto = parseDecimal(row[10]);

    const venta: VentaParsed = {
      numero: numero || null,
      fecha,
      sku: currentSku,
      producto: currentProducto,
      cliente: stringify(row[3]) || null,
      vendedor: stringify(row[4]) || null,
      almacen: esAnulada ? "*ANULADO*" : (col5 || null),
      cantidad,
      unidad: stringify(row[7]) || null,
      precioUnitario,
      descuentoPct: parseDecimal(row[9]),
      neto: esAnulada ? 0 : neto,
      anulada: esAnulada,
    };

    ventas.push(venta);
    if (esAnulada) filasAnuladas++;

    if (currentSku) skus.add(currentSku);
    if (venta.cliente) clientes.add(venta.cliente);

    if (!periodoInicio || fecha < periodoInicio) periodoInicio = fecha;
    if (!periodoFin || fecha > periodoFin) periodoFin = fecha;
  }

  return {
    ventas,
    filasParseadas: ventas.length,
    filasAnuladas,
    filasSaltadas,
    periodoInicio,
    periodoFin,
    encabezadoDetectado,
    metadata: {
      columnas: headers,
      skusUnicos: skus.size,
      clientesUnicos: clientes.size,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internos

function stringify(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function isNumericLike(s: string): boolean {
  // True para "1000000277", "2000000179 *", false para "007GE", "024GE"
  return /^[\d\s\*\.\,]+$/.test(s);
}

function parseDecimal(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function emptyResult(): ParseVentasResult {
  return {
    ventas: [],
    filasParseadas: 0,
    filasAnuladas: 0,
    filasSaltadas: 0,
    periodoInicio: null,
    periodoFin: null,
    encabezadoDetectado: false,
    metadata: { columnas: [], skusUnicos: 0, clientesUnicos: 0 },
  };
}
