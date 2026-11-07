/**
 * Todo lo que depende de la moneda de la boleta: validar el código, cuántos decimales usa,
 * redondear y cómo nombrarla en voz alta.
 */

export const DEFAULT_CURRENCY = "CLP";
const DISPLAY_LOCALE = "es-CL";

const SPOKEN_CURRENCY_NAMES: Record<string, string> = {
  CLP: "pesos",
  ARS: "pesos argentinos",
  MXN: "pesos mexicanos",
  COP: "pesos colombianos",
  UYU: "pesos uruguayos",
  EUR: "euros",
  USD: "dólares",
  PEN: "soles",
  BRL: "reales",
};

/** Devuelve un código ISO 4217 válido; si el modelo entregó algo inválido (ej: "€"), CLP. */
export function normalizeCurrency(code: string): string {
  const candidate = code.trim().toUpperCase();
  try {
    new Intl.NumberFormat(DISPLAY_LOCALE, { style: "currency", currency: candidate });
    return candidate;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

/** CLP -> 0, EUR -> 2. */
export function getCurrencyDecimals(currency: string): number {
  return new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: "currency",
    currency: normalizeCurrency(currency),
  }).resolvedOptions().maximumFractionDigits!;
}

/** Redondea a la unidad mínima de la moneda (evita errores de punto flotante al sumar). */
export function roundToCurrency(amount: number, currency: string): number {
  const factor = 10 ** getCurrencyDecimals(currency);
  return Math.round(amount * factor) / factor;
}

/** Unidad mínima de la moneda: CLP -> 1, EUR -> 0.01. */
export function smallestCurrencyUnit(currency: string): number {
  return 10 ** -getCurrencyDecimals(currency);
}

/** 12500, "CLP" -> "$12.500"; 9, "EUR" -> "EUR 9,00". */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: "currency",
    currency: normalizeCurrency(currency),
    // "ARS 3.650" en vez de "ARS 3.650,00": más corto y legible; los céntimos reales se muestran.
    trailingZeroDisplay: "stripIfInteger",
  }).format(amount);
}

/**
 * Para leer en voz alta: 12500, "CLP" -> "12500 pesos"; 221.85, "EUR" -> "221,85 euros".
 * Sin separador de miles: los sintetizadores leen mal "$12.500".
 */
export function formatSpokenAmount(amount: number, currency: string): string {
  const code = normalizeCurrency(currency);
  const number = amount.toLocaleString(DISPLAY_LOCALE, {
    maximumFractionDigits: getCurrencyDecimals(code),
    useGrouping: false,
  });
  return `${number} ${SPOKEN_CURRENCY_NAMES[code] ?? code}`;
}
