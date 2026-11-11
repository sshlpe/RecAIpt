import { formatCurrency, normalizeCurrency } from "@/lib/format/currency";
import { formatQuantityLabel } from "@/lib/format/format-numbers";
import {
  PRINTED_TOTAL_FIELDS,
  toEditableReceipt,
  type EditableItem,
  type EditableReceipt,
} from "./editable-receipt";
import type { Receipt } from "./receipt-schema";

/**
 * Qué cambió el usuario respecto de lo que leyó la IA. `before` null = lo agregó;
 * `after` null = lo quitó. Los textos ya vienen formateados para mostrarse.
 */
export interface ReceiptCorrection {
  label: string;
  before: string | null;
  after: string | null;
}

const NOT_PRINTED = "no aparece";

/** Combinar productos solo los agrupa: no es una corrección de lo leído. */
function effectiveName(item: EditableItem): string {
  return item.mergedFrom ?? item.name;
}

function describeItem(item: EditableItem, currency: string): string {
  const name = effectiveName(item);
  const label = item.quantity === 1 ? name : formatQuantityLabel(item.quantity, name);
  return `${label}: ${formatCurrency(item.lineTotal, currency)}`;
}

function isItemChanged(original: EditableItem, edited: EditableItem): boolean {
  return (
    effectiveName(original) !== effectiveName(edited) ||
    original.quantity !== edited.quantity ||
    original.lineTotal !== edited.lineTotal
  );
}

/**
 * Las líneas leídas conservan su id (`toEditableReceipt`). Se exige el mismo texto original:
 * un producto agregado a mano podría reutilizar el id de una línea leída que se borró.
 */
function findItemCorrections(
  original: Receipt,
  edited: EditableReceipt,
  currency: string,
): ReceiptCorrection[] {
  const originalItems = toEditableReceipt(original).items;
  const isSameLine = (a: EditableItem, b: EditableItem) =>
    a.id === b.id && a.originalText === b.originalText;
  const corrections: ReceiptCorrection[] = [];

  for (const originalItem of originalItems) {
    const editedItem = edited.items.find((item) => isSameLine(item, originalItem));
    if (!editedItem) {
      corrections.push({
        label: effectiveName(originalItem),
        before: describeItem(originalItem, currency),
        after: null,
      });
    } else if (isItemChanged(originalItem, editedItem)) {
      corrections.push({
        label: effectiveName(editedItem),
        before: describeItem(originalItem, currency),
        after: describeItem(editedItem, currency),
      });
    }
  }
  for (const editedItem of edited.items) {
    if (!originalItems.some((item) => isSameLine(item, editedItem))) {
      corrections.push({
        label: effectiveName(editedItem),
        before: null,
        after: describeItem(editedItem, currency),
      });
    }
  }
  return corrections;
}

function findTotalsCorrections(
  original: Receipt,
  edited: EditableReceipt,
  currency: string,
): ReceiptCorrection[] {
  const describe = (amount: number | null) =>
    amount === null ? NOT_PRINTED : formatCurrency(amount, currency);
  return PRINTED_TOTAL_FIELDS.filter(({ key }) => original[key] !== edited[key]).map(
    ({ key, label }) => ({
      label,
      before: describe(original[key]),
      after: describe(edited[key]),
    }),
  );
}

/** Productos corregidos, agregados o quitados, y montos del pie de la boleta cambiados. */
export function findCorrections(original: Receipt, edited: EditableReceipt): ReceiptCorrection[] {
  const currency = normalizeCurrency(edited.currency);
  return [
    ...findItemCorrections(original, edited, currency),
    ...findTotalsCorrections(original, edited, currency),
  ];
}
