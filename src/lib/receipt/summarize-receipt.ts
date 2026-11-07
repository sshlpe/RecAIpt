import { formatCurrency, normalizeCurrency } from "@/lib/format/currency";
import { buildSpokenSummary } from "./build-spoken-summary";
import { isDoubtful } from "./confidence";
import {
  describeVerification,
  type AmountFormatter,
  type VerificationMessage,
} from "./describe-verification";
import type { EditableItem, EditableReceipt } from "./editable-receipt";
import { groupItemsByName, type ItemGroup } from "./group-items";
import { verifyReceipt, type ReceiptVerification } from "./verify-totals";

export interface ItemIssue {
  message: string;
  /** Una duda de lectura se puede descartar ("Está bien"); un error de cálculo, no. */
  canDismiss: boolean;
}

export interface ReceiptSummary {
  currency: string;
  formatAmount: AmountFormatter;
  groups: ItemGroup<EditableItem>[];
  verification: ReceiptVerification;
  message: VerificationMessage;
  issuesByItemId: Map<string, ItemIssue>;
  issueCount: number;
  spokenSummary: string;
}

const DEFAULT_DOUBT_MESSAGE = "No se leyó con total seguridad.";

export function findItemIssues(
  receipt: EditableReceipt,
  verification: ReceiptVerification,
  formatAmount: AmountFormatter,
): Map<string, ItemIssue> {
  const issues = new Map<string, ItemIssue>();
  for (const item of receipt.items) {
    if (isDoubtful(item.confidence)) {
      issues.set(item.id, { message: item.doubtReason ?? DEFAULT_DOUBT_MESSAGE, canDismiss: true });
    }
  }
  for (const { itemIndex, comparison } of verification.lineMismatches) {
    issues.set(receipt.items[itemIndex].id, {
      message:
        `Cantidad × precio da ${formatAmount(comparison.expected)}, ` +
        `pero la línea dice ${formatAmount(comparison.printed)}.`,
      canDismiss: false,
    });
  }
  return issues;
}

function countTotalsIssues(verification: ReceiptVerification): number {
  const checks = [verification.subtotalCheck, verification.totalCheck];
  return checks.filter((check) => check && !check.matches).length;
}

/** Todo lo que la pantalla necesita mostrar, derivado de la boleta (editada o no). */
export function summarizeReceipt(receipt: EditableReceipt): ReceiptSummary {
  const currency = normalizeCurrency(receipt.currency);
  const formatAmount = (amount: number) => formatCurrency(amount, currency);
  const verification = verifyReceipt({ ...receipt, currency });
  const groups = groupItemsByName(receipt.items, currency);
  const issuesByItemId = findItemIssues(receipt, verification, formatAmount);

  return {
    currency,
    formatAmount,
    groups,
    verification,
    message: describeVerification(verification, receipt.items.length, formatAmount),
    issuesByItemId,
    issueCount: issuesByItemId.size + countTotalsIssues(verification),
    spokenSummary: buildSpokenSummary(groups, verification, currency),
  };
}
