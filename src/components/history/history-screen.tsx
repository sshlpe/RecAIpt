"use client";

import Link from "next/link";
import { useReceiptHistory } from "@/hooks/use-receipt-history";
import { HOME_PATH } from "@/lib/config/routes";
import { hasReceiptInProgress, useActiveReceipt } from "../active-receipt-provider";
import { actionButtonClassName } from "../ui/action-button";
import { ReceiptHistoryList } from "./receipt-history-list";

/** Lista de boletas; si hay una en curso, un acceso para volver a ella sin perderla. */
export function HistoryScreen() {
  const history = useReceiptHistory();
  const { analysis, session } = useActiveReceipt();
  const activeReceiptId = analysis.state.status === "done" ? analysis.state.saved.id : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Historial</h1>
      {hasReceiptInProgress(analysis) && (
        <Link href={HOME_PATH} className={actionButtonClassName("primary", "large")}>
          ← Seguir con la boleta {session ? "que estás revisando" : "en curso"}
        </Link>
      )}
      {history.status === "ready" && (
        <ReceiptHistoryList entries={history.value} activeReceiptId={activeReceiptId} />
      )}
    </div>
  );
}
