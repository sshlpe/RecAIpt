import { toGroupingKey } from "./group-items";
import type { Receipt, ReceiptItem } from "./receipt-schema";
import type { TipChoice } from "./tip";

/**
 * Boleta que el usuario puede corregir. Las funciones son puras (devuelven una copia),
 * así el hook de React solo guarda estado y la lógica se puede probar aislada.
 */

export interface EditableItem extends ReceiptItem {
  id: string;
  userEdited: boolean;
  /** Nombre que tenía antes de combinarse con otro producto (null si no está combinada). */
  mergedFrom: string | null;
}

export interface EditableReceipt extends Omit<Receipt, "items"> {
  items: EditableItem[];
  /**
   * Propina elegida por el usuario. null = usar la escrita en la boleta (si hay). Tiene prioridad
   * sobre la escrita: sirve para corregir una mala lectura o dar otra que la sugerida.
   */
  addedTip: TipChoice | null;
}

/** Lo que el usuario puede escribir de un producto. */
export type ItemDraft = Pick<ReceiptItem, "name" | "quantity" | "unitPrice" | "lineTotal">;

export type PrintedTotals = Pick<
  Receipt,
  "printedSubtotal" | "printedDiscount" | "printedTaxes" | "printedTip" | "printedTotal"
>;

/** Montos del pie de la boleta, con su nombre en pantalla (formulario y correcciones). */
export const PRINTED_TOTAL_FIELDS: { key: keyof PrintedTotals; label: string }[] = [
  { key: "printedSubtotal", label: "Subtotal" },
  { key: "printedDiscount", label: "Descuento" },
  { key: "printedTaxes", label: "Impuestos que se suman aparte" },
  { key: "printedTip", label: "Propina" },
  { key: "printedTotal", label: "Total" },
];

/** Datos de la boleta que no son montos: de qué local y de qué día. */
export type ReceiptInfo = Pick<Receipt, "merchantName" | "purchaseDate">;

export const ADDED_ITEM_ORIGINAL_TEXT = "Agregado por ti";

/** Una línea revisada por el usuario deja de estar en duda. */
const CONFIRMED_BY_USER = { confidence: "high", doubtReason: null } as const;

const ID_PREFIX = "item-";

function toItemId(index: number): string {
  return `${ID_PREFIX}${index}`;
}

function nextItemId(items: EditableItem[]): string {
  const usedNumbers = items.map((item) => Number(item.id.slice(ID_PREFIX.length)));
  return toItemId(usedNumbers.length === 0 ? 0 : Math.max(...usedNumbers) + 1);
}

function mapItem(
  receipt: EditableReceipt,
  itemId: string,
  change: (item: EditableItem) => EditableItem,
): EditableReceipt {
  return {
    ...receipt,
    items: receipt.items.map((item) => (item.id === itemId ? change(item) : item)),
  };
}

export function toEditableReceipt(receipt: Receipt): EditableReceipt {
  return {
    ...receipt,
    items: receipt.items.map((item, index) => ({
      ...item,
      id: toItemId(index),
      userEdited: false,
      mergedFrom: null,
    })),
    addedTip: null,
  };
}

export function findItem(receipt: EditableReceipt, itemId: string): EditableItem | undefined {
  return receipt.items.find((item) => item.id === itemId);
}

export function updateItem(
  receipt: EditableReceipt,
  itemId: string,
  draft: ItemDraft,
): EditableReceipt {
  return mapItem(receipt, itemId, (item) => ({
    ...item,
    ...draft,
    ...CONFIRMED_BY_USER,
    userEdited: true,
    // Renombrarla a mano la saca de la combinación: el nombre nuevo lo eligió el usuario.
    mergedFrom: draft.name === item.name ? item.mergedFrom : null,
  }));
}

/**
 * Edición rápida: el usuario corrige solo el total de la línea. El precio unitario se descarta:
 * si se mantuviera, cantidad × precio ya no calzaría con el total confirmado y se marcaría
 * un error que no existe.
 */
export function updateLineTotal(
  receipt: EditableReceipt,
  itemId: string,
  lineTotal: number,
): EditableReceipt {
  return mapItem(receipt, itemId, (item) => ({
    ...item,
    lineTotal,
    unitPrice: null,
    ...CONFIRMED_BY_USER,
    userEdited: true,
  }));
}

/**
 * "Combinar con otro producto": todas las líneas del grupo de `sourceName` pasan a llamarse
 * `targetName`, y como los grupos se arman por nombre, quedan en un solo grupo.
 * Cada línea recuerda su nombre previo para poder separarla; si ya venía combinada, conserva
 * el original (A -> B -> C separa de vuelta a A). No es una corrección de montos, así que ni
 * confirma la línea ni la marca como corregida.
 */
export function mergeGroupInto(
  receipt: EditableReceipt,
  sourceName: string,
  targetName: string,
): EditableReceipt {
  const sourceKey = toGroupingKey(sourceName);
  return {
    ...receipt,
    items: receipt.items.map((item) =>
      toGroupingKey(item.name) === sourceKey
        ? { ...item, name: targetName, mergedFrom: item.mergedFrom ?? item.name }
        : item,
    ),
  };
}

/** "Separar": las líneas combinadas recuperan el nombre que tenían antes de combinarse. */
export function splitMergedItems(receipt: EditableReceipt, itemIds: string[]): EditableReceipt {
  const ids = new Set(itemIds);
  return {
    ...receipt,
    items: receipt.items.map((item) =>
      ids.has(item.id) && item.mergedFrom !== null
        ? { ...item, name: item.mergedFrom, mergedFrom: null }
        : item,
    ),
  };
}

export function hasMergedItems(items: EditableItem[]): boolean {
  return items.some((item) => item.mergedFrom !== null);
}

/** "Está bien": el usuario revisó la línea y la lectura era correcta. */
export function confirmItem(receipt: EditableReceipt, itemId: string): EditableReceipt {
  return mapItem(receipt, itemId, (item) => ({ ...item, ...CONFIRMED_BY_USER }));
}

export function removeItem(receipt: EditableReceipt, itemId: string): EditableReceipt {
  return { ...receipt, items: receipt.items.filter((item) => item.id !== itemId) };
}

export function addItem(receipt: EditableReceipt, draft: ItemDraft): EditableReceipt {
  const newItem: EditableItem = {
    ...draft,
    ...CONFIRMED_BY_USER,
    id: nextItemId(receipt.items),
    originalText: ADDED_ITEM_ORIGINAL_TEXT,
    userEdited: true,
    mergedFrom: null,
  };
  return { ...receipt, items: [...receipt.items, newItem] };
}

export function setAddedTip(receipt: EditableReceipt, tip: TipChoice | null): EditableReceipt {
  return { ...receipt, addedTip: tip };
}

export function updatePrintedTotals(
  receipt: EditableReceipt,
  totals: PrintedTotals,
): EditableReceipt {
  return { ...receipt, ...totals };
}

/** Nombre del local y fecha; vacío = no aparece (se muestra "Boleta" y el día en que se leyó). */
export function updateReceiptInfo(receipt: EditableReceipt, info: ReceiptInfo): EditableReceipt {
  return {
    ...receipt,
    merchantName: info.merchantName?.trim() || null,
    purchaseDate: info.purchaseDate || null,
  };
}

/**
 * "Restablecer": vuelve a lo que leyó la IA. Deshace las correcciones de lectura (productos y montos) pero
 * conserva lo que decidió el usuario y no es una lectura: nombre, fecha y propina elegida.
 */
export function discardReadingCorrections(
  receipt: EditableReceipt,
  original: Receipt,
): EditableReceipt {
  return {
    ...toEditableReceipt(original),
    merchantName: receipt.merchantName,
    purchaseDate: receipt.purchaseDate,
    addedTip: receipt.addedTip,
  };
}
