import { toEditableReceipt, type EditableReceipt } from "@/lib/receipt/editable-receipt";
import type { Receipt } from "@/lib/receipt/receipt-schema";
import { createBillSplit, type BillSplit } from "@/lib/split/bill-split";

/** Sube cuando cambia la forma de lo guardado, para poder migrar boletas viejas. */
export const SAVED_RECEIPT_SCHEMA_VERSION = 1;

/**
 * Boleta guardada en el dispositivo. Solo el estado editable (lo leído + correcciones + división):
 * totales, grupos y verificación se recalculan al abrirla, así nunca contradicen a la lógica.
 */
export interface SavedReceipt {
  id: string;
  schemaVersion: typeof SAVED_RECEIPT_SCHEMA_VERSION;
  /** ISO: cuándo se leyó la foto. Ordena el historial y es la fecha si la boleta no trae una. */
  readAt: string;
  /** Lo que leyó la IA, intacto: contra esto se calculan las correcciones. */
  original: Receipt;
  receipt: EditableReceipt;
  split: BillSplit;
}

/** Boleta recién leída, todavía sin correcciones. */
export function createSavedReceipt(receipt: Receipt, readAt: Date = new Date()): SavedReceipt {
  return {
    id: crypto.randomUUID(),
    schemaVersion: SAVED_RECEIPT_SCHEMA_VERSION,
    readAt: readAt.toISOString(),
    original: receipt,
    receipt: toEditableReceipt(receipt),
    split: createBillSplit(),
  };
}

export function isCurrentSchema(value: unknown): value is SavedReceipt {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Partial<SavedReceipt>).schemaVersion === SAVED_RECEIPT_SCHEMA_VERSION
  );
}
