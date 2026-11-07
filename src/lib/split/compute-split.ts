import { getCurrencyDecimals, roundToCurrency } from "@/lib/format/currency";
import { formatQuantity } from "@/lib/format/format-numbers";
import { distributeRounded } from "@/lib/math/distribute-rounded";
import { sumBy } from "@/lib/math/sum-by";
import { toGroupingKey, type ItemGroup } from "@/lib/receipt/group-items";
import {
  getAllocation,
  type BillSplit,
  type ProductAllocation,
  type SplitParty,
} from "./bill-split";

/** Descuento, impuestos agregados y propina: se reparten en proporción al consumo. */
export interface SplitCharges {
  itemsSum: number;
  discount: number;
  taxes: number;
  tip: number;
}

export interface PartyLine {
  label: string;
  amount: number;
}

export interface PartyBill {
  party: SplitParty;
  lines: PartyLine[];
  subtotal: number;
  discount: number;
  taxes: number;
  tip: number;
  total: number;
}

export interface SplitResult {
  bills: PartyBill[];
  /** Consumo que todavía no se asigna a ningún grupo. */
  unassignedAmount: number;
}

export function productKey(group: ItemGroup): string {
  return toGroupingKey(group.name);
}

/** Unidades repartibles: la cantidad si es entera; un producto por peso (1,45 kg) es 1 unidad. */
export function allocatableUnits(group: ItemGroup): number {
  return Number.isInteger(group.totalQuantity) ? group.totalQuantity : 1;
}

export function assignedUnits(allocation: ProductAllocation): number {
  return sumBy(Object.values(allocation.unitsByParty), (units) => units);
}

/** Unidades sin grupo. Compartido: nada pendiente si al menos un grupo está marcado. */
export function remainingUnits(group: ItemGroup, allocation: ProductAllocation): number {
  if (allocation.sharedBy) return allocation.sharedBy.length > 0 ? 0 : allocatableUnits(group);
  return allocatableUnits(group) - assignedUnits(allocation);
}

function describeUnits(group: ItemGroup, units: number): string {
  const shown = Number.isInteger(group.totalQuantity) ? units : group.totalQuantity;
  return `${formatQuantity(shown)} × ${group.name}`;
}

/** Lo que consumió un grupo de un producto (null si no le toca nada). */
function partyLine(
  group: ItemGroup,
  allocation: ProductAllocation,
  partyId: string,
): PartyLine | null {
  const { sharedBy } = allocation;
  if (sharedBy) {
    if (!sharedBy.includes(partyId)) return null;
    return {
      label: `${group.name} (compartido entre ${sharedBy.length})`,
      amount: group.totalAmount / sharedBy.length,
    };
  }
  const units = allocation.unitsByParty[partyId] ?? 0;
  if (units === 0) return null;
  const unitAmount = group.totalAmount / allocatableUnits(group);
  return { label: describeUnits(group, units), amount: units * unitAmount };
}

function unassignedAmountOf(group: ItemGroup, allocation: ProductAllocation): number {
  return (remainingUnits(group, allocation) * group.totalAmount) / allocatableUnits(group);
}

/** Cuánto paga cada grupo: su consumo, más su parte de propina, menos su parte de descuento. */
export function computeSplit(
  groups: ItemGroup[],
  split: BillSplit,
  charges: SplitCharges,
  currency: string,
): SplitResult {
  const rawBills = split.parties.map((party) => {
    const lines = groups.flatMap(
      (group) => partyLine(group, getAllocation(split, productKey(group)), party.id) ?? [],
    );
    const subtotal = sumBy(lines, (line) => line.amount);
    const share = charges.itemsSum > 0 ? subtotal / charges.itemsSum : 0;
    const discount = charges.discount * share;
    const taxes = charges.taxes * share;
    const tip = charges.tip * share;
    const total = subtotal - discount + taxes + tip;
    return { party, lines, subtotal, discount, taxes, tip, total };
  });

  const roundedTotals = distributeRounded(
    rawBills.map((bill) => bill.total),
    getCurrencyDecimals(currency),
  );
  const round = (amount: number) => roundToCurrency(amount, currency);

  return {
    bills: rawBills.map((bill, index) => ({
      ...bill,
      lines: bill.lines.map((line) => ({ ...line, amount: round(line.amount) })),
      subtotal: round(bill.subtotal),
      discount: round(bill.discount),
      taxes: round(bill.taxes),
      tip: round(bill.tip),
      total: roundedTotals[index],
    })),
    unassignedAmount: round(
      sumBy(groups, (group) => unassignedAmountOf(group, getAllocation(split, productKey(group)))),
    ),
  };
}
