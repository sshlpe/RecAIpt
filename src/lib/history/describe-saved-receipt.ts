import { receiptDateLabel, receiptTitle } from "@/lib/receipt/receipt-info";
import { summarizeReceipt } from "@/lib/receipt/summarize-receipt";
import type { SavedReceipt } from "./saved-receipt";

/** Lo que muestra una fila del historial, ya formateado. */
export interface HistoryEntry {
  id: string;
  title: string;
  dateLabel: string;
  totalLabel: string;
}

export function toHistoryEntry(saved: SavedReceipt): HistoryEntry {
  const summary = summarizeReceipt(saved.receipt);
  return {
    id: saved.id,
    title: receiptTitle(saved.receipt),
    dateLabel: receiptDateLabel(saved.receipt, saved.readAt),
    totalLabel: summary.formatAmount(summary.payableTotal),
  };
}
