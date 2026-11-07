import { roundToCurrency } from "@/lib/format/currency";
import { sumBy } from "@/lib/math/sum-by";
import { lowestConfidence } from "./confidence";
import type { ConfidenceLevel, ReceiptItem } from "./receipt-schema";

export interface ItemGroup<T extends ReceiptItem = ReceiptItem> {
  name: string;
  totalQuantity: number;
  totalAmount: number;
  confidence: ConfidenceLevel;
  items: T[];
}

/** Clave de agrupación: ignora mayúsculas, tildes y espacios extra. */
export function toGroupingKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function buildGroup<T extends ReceiptItem>(items: T[], currency: string): ItemGroup<T> {
  return {
    name: items[0].name,
    totalQuantity: sumBy(items, (item) => item.quantity),
    totalAmount: roundToCurrency(
      sumBy(items, (item) => item.lineTotal),
      currency,
    ),
    confidence: lowestConfidence(items.map((item) => item.confidence)),
    items,
  };
}

/** Agrupa líneas del mismo producto, ordenadas de mayor a menor monto. */
export function groupItemsByName<T extends ReceiptItem>(
  items: T[],
  currency: string,
): ItemGroup<T>[] {
  const itemsByKey = new Map<string, T[]>();
  for (const item of items) {
    const key = toGroupingKey(item.name);
    itemsByKey.set(key, [...(itemsByKey.get(key) ?? []), item]);
  }
  return [...itemsByKey.values()]
    .map((groupItems) => buildGroup(groupItems, currency))
    .sort((first, second) => second.totalAmount - first.totalAmount);
}
