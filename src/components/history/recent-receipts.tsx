"use client";

import { useReceiptHistory } from "@/hooks/use-receipt-history";
import { ReceiptHistoryList } from "./receipt-history-list";

/** Carga el historial del dispositivo y lo muestra; mientras carga no ocupa espacio. */
export function RecentReceipts() {
  const history = useReceiptHistory();
  return history.status === "ready" ? <ReceiptHistoryList entries={history.value} /> : null;
}
