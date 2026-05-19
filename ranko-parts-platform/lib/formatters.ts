export const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const compactNumberFormatter = new Intl.NumberFormat("es-VE", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatUsd(value: number | string) {
  return usdFormatter.format(Number(value));
}

export function formatVenezuelaPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("58") && digits.length === 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 12)}`;
  }

  return value;
}
