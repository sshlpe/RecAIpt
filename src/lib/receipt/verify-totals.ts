import { roundToCurrency, smallestCurrencyUnit } from "@/lib/format/currency";
import { sumBy } from "@/lib/math/sum-by";
import { isDoubtful } from "./confidence";
import { tipBase, tipPercentOf } from "./tip";
import type { Receipt, ReceiptItem } from "./receipt-schema";

export interface AmountComparison {
  expected: number;
  printed: number;
  difference: number;
  matches: boolean;
}

export interface LineMismatch {
  itemIndex: number;
  comparison: AmountComparison;
}

export interface ReceiptVerification {
  itemsSum: number;
  /** Total "real" según los productos (suma − descuento + propina si corresponde). */
  calculatedTotal: number;
  tipIncluded: boolean;
  lineMismatches: LineMismatch[];
  subtotalCheck: AmountComparison | null;
  totalCheck: AmountComparison | null;
  tipPercentage: number | null;
  doubtfulItemIndexes: number[];
  isConsistent: boolean;
}

/**
 * Compara un monto calculado contra el escrito, redondeando a la moneda.
 * `difference` > 0 = la boleta cobra de más. `tolerance` absorbe redondeos legítimos.
 */
export function compareAmounts(
  expected: number,
  printed: number,
  currency: string,
  tolerance = 0,
): AmountComparison {
  const roundedExpected = roundToCurrency(expected, currency);
  const difference = roundToCurrency(printed - roundedExpected, currency);
  return {
    expected: roundedExpected,
    printed,
    difference,
    matches: Math.abs(difference) <= tolerance,
  };
}

/** Cantidad × precio admite una unidad mínima de diferencia (productos por peso se redondean). */
function checkLine(item: ReceiptItem, currency: string): AmountComparison | null {
  if (item.unitPrice === null) return null;
  const tolerance = smallestCurrencyUnit(currency);
  return compareAmounts(item.quantity * item.unitPrice, item.lineTotal, currency, tolerance);
}

export function findLineMismatches(items: ReceiptItem[], currency: string): LineMismatch[] {
  return items.flatMap((item, itemIndex) => {
    const comparison = checkLine(item, currency);
    return comparison && !comparison.matches ? [{ itemIndex, comparison }] : [];
  });
}

export function findDoubtfulItemIndexes(items: ReceiptItem[]): number[] {
  return items.flatMap((item, itemIndex) => (isDoubtful(item.confidence) ? [itemIndex] : []));
}

/** El candidato más cercano al objetivo; en empate, el primero. */
function closestTo(candidates: number[], target: number): number {
  return candidates.reduce((closest, candidate) =>
    Math.abs(candidate - target) < Math.abs(closest - target) ? candidate : closest,
  );
}

/** Productos − descuento + impuestos agregados aparte: lo que se cobra antes de la propina. */
export function amountBeforeTip(receipt: Receipt, itemsSum: number): number {
  return itemsSum - (receipt.printedDiscount ?? 0) + (receipt.printedTaxes ?? 0);
}

/**
 * Total "real" a partir de los productos. Si hay propina, se incluye; salvo que el total escrito
 * claramente no la incluya (varía según el local), para comparar lo mismo con lo mismo.
 */
export function calculateTotal(
  receipt: Receipt,
  itemsSum: number,
): { amount: number; tipIncluded: boolean } {
  const withoutTip = amountBeforeTip(receipt, itemsSum);
  if (receipt.printedTip === null) return { amount: withoutTip, tipIncluded: false };
  const withTip = withoutTip + receipt.printedTip;
  if (receipt.printedTotal === null) return { amount: withTip, tipIncluded: true };
  const amount = closestTo([withTip, withoutTip], receipt.printedTotal);
  return { amount, tipIncluded: amount === withTip };
}

export function calculateTipPercentage(receipt: Receipt, itemsSum: number): number | null {
  if (receipt.printedTip === null) return null;
  return tipPercentOf(receipt.printedTip, tipBase(itemsSum));
}

export function verifyReceipt(receipt: Receipt): ReceiptVerification {
  const { currency } = receipt;
  const itemsSum = roundToCurrency(
    sumBy(receipt.items, (item) => item.lineTotal),
    currency,
  );
  const total = calculateTotal(receipt, itemsSum);
  const calculatedTotal = roundToCurrency(total.amount, currency);
  const lineMismatches = findLineMismatches(receipt.items, currency);
  const subtotalCheck =
    receipt.printedSubtotal === null
      ? null
      : compareAmounts(itemsSum, receipt.printedSubtotal, currency);
  const totalCheck =
    receipt.printedTotal === null
      ? null
      : compareAmounts(calculatedTotal, receipt.printedTotal, currency);

  return {
    itemsSum,
    calculatedTotal,
    tipIncluded: total.tipIncluded,
    lineMismatches,
    subtotalCheck,
    totalCheck,
    tipPercentage: calculateTipPercentage(receipt, itemsSum),
    doubtfulItemIndexes: findDoubtfulItemIndexes(receipt.items),
    isConsistent:
      lineMismatches.length === 0 &&
      (subtotalCheck?.matches ?? true) &&
      (totalCheck?.matches ?? true),
  };
}
