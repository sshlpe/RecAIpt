import { formatSpokenAmount } from "@/lib/format/currency";
import { formatQuantity } from "@/lib/format/format-numbers";
import { describeVerification, type AmountFormatter } from "./describe-verification";
import type { ItemGroup } from "./group-items";
import type { ReceiptVerification } from "./verify-totals";

function describeGroup(group: ItemGroup, formatAmount: AmountFormatter): string {
  return `${formatQuantity(group.totalQuantity)} ${group.name}, ${formatAmount(group.totalAmount)}.`;
}

/** Texto para leer la boleta en voz alta: primero el resultado, después cada producto. */
export function buildSpokenSummary(
  groups: ItemGroup[],
  verification: ReceiptVerification,
  currency: string,
): string {
  const formatAmount = (amount: number) => formatSpokenAmount(amount, currency);
  const message = describeVerification(verification, groups.length, formatAmount);
  const groupLines = groups.map((group) => describeGroup(group, formatAmount));
  return [message.title + ".", ...message.details, ...groupLines].join(" ");
}
