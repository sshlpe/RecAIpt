const NUMBER_LOCALE = "es-CL";

/** Máximo de decimales en cantidades (productos por peso: 1,452 kg). */
export const QUANTITY_DECIMALS = 3;

/** 2 -> "2", 1.45 -> "1,45" (cantidades por peso). */
export function formatQuantity(quantity: number): string {
  return quantity.toLocaleString(NUMBER_LOCALE, { maximumFractionDigits: QUANTITY_DECIMALS });
}

/** Valor inicial de un campo editable: sin separador de miles para que sea fácil de corregir. */
export function formatNumberForInput(value: number | null, maxDecimals: number): string {
  if (value === null) return "";
  return value.toLocaleString(NUMBER_LOCALE, {
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  });
}

/**
 * Interpreta un número escrito por el usuario según cuántos decimales admite:
 * - Sin decimales (CLP): "12.500", "12,500" y "12500" -> 12500.
 * - Con decimales: si hay coma, es decimal y el punto es de miles ("1.234,5" -> 1234.5);
 *   si no hay coma, el punto es decimal ("4.5" -> 4.5).
 * Devuelve null si el texto no es un número.
 */
export function parseLocaleNumber(text: string, maxDecimals: number): number | null {
  const cleaned = text.replace(/[^\d.,-]/g, "");
  if (!/\d/.test(cleaned)) return null;
  const normalized =
    maxDecimals === 0
      ? cleaned.replace(/[.,]/g, "")
      : cleaned.includes(",")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Campo opcional: vacío -> null (válido); texto que no es número -> inválido. */
export function parseOptionalNumber(
  text: string,
  maxDecimals: number,
): { value: number | null; isValid: boolean } {
  if (text.trim() === "") return { value: null, isValid: true };
  const value = parseLocaleNumber(text, maxDecimals);
  return { value, isValid: value !== null };
}
