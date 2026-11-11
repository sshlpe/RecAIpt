"use client";

import { toHistoryEntry, type HistoryEntry } from "@/lib/history/describe-saved-receipt";
import { getReceipt, listReceipts } from "@/lib/history/receipt-history-store";
import type { SavedReceipt } from "@/lib/history/saved-receipt";
import { useAsyncValue, type AsyncValue } from "./use-async-value";

const HISTORY_KEY = "all";

async function loadHistoryEntries(): Promise<HistoryEntry[]> {
  return (await listReceipts()).map(toHistoryEntry);
}

/** Boletas anteriores para el inicio, la última leída primero. */
export function useReceiptHistory(): AsyncValue<HistoryEntry[]> {
  return useAsyncValue(loadHistoryEntries, [], HISTORY_KEY);
}

/** Una boleta del historial por id; `value` null si no existe. */
export function useSavedReceipt(id: string): AsyncValue<SavedReceipt | null> {
  return useAsyncValue(() => getReceipt(id), null, id);
}
