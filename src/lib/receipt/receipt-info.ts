import type { ReceiptInfo } from "./editable-receipt";

const DEFAULT_TITLE = "Boleta";
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_FORMAT = new Intl.DateTimeFormat("es-CL", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function receiptTitle(info: ReceiptInfo): string {
  return info.merchantName?.trim() || DEFAULT_TITLE;
}

/** "2026-11-10" como fecha local; null si viene vacía o con otro formato. */
function parseIsoDate(text: string | null): Date | null {
  const match = text ? ISO_DATE_PATTERN.exec(text) : null;
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Valor para <input type="date">: la fecha escrita si es válida, si no vacío. */
export function toDateInputValue(info: ReceiptInfo): string {
  return parseIsoDate(info.purchaseDate) ? (info.purchaseDate ?? "") : "";
}

/** La fecha de la boleta; si no trae (o no se entiende), el día en que se leyó (`readAt`, ISO). */
export function receiptDateLabel(info: ReceiptInfo, readAt: string): string {
  return DATE_FORMAT.format(parseIsoDate(info.purchaseDate) ?? new Date(readAt));
}
