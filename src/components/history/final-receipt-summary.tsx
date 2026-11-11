"use client";

import { useMemo, type ReactNode } from "react";
import type { ReceiptSession } from "@/hooks/use-receipt-session";
import { isSplitInUse } from "@/lib/split/bill-split";
import { computeSplit } from "@/lib/split/compute-split";
import { ReceiptHeader } from "../receipt-header";
import { PartyBills } from "../split/party-bills";
import { ActionButton } from "../ui/action-button";
import { CorrectionsList } from "./corrections-list";
import { ReceiptStatement } from "./receipt-statement";

interface FinalReceiptSummaryProps {
  session: ReceiptSession;
  onOpenFullReceipt: () => void;
  /** Al final (ej: borrar). */
  children?: ReactNode;
}

/**
 * Versión final de una boleta del historial, solo lectura: la boleta en limpio, cuánto pagó
 * cada grupo (si se dividió) y qué se corrigió. Para cambiar algo se abre la boleta completa.
 */
export function FinalReceiptSummary({
  session,
  onOpenFullReceipt,
  children,
}: FinalReceiptSummaryProps) {
  const { receipt, actions, summary, corrections, billSplit } = session;
  const { split } = billSplit;
  const splitResult = useMemo(
    () =>
      isSplitInUse(split)
        ? computeSplit(summary.groups, split, summary.charges, summary.currency)
        : null,
    [split, summary],
  );

  return (
    <div className="space-y-8">
      <ReceiptHeader info={receipt} readAt={session.readAt} onSave={actions.saveInfo} />
      <ReceiptStatement summary={summary} />
      {splitResult && <PartyBills result={splitResult} formatAmount={summary.formatAmount} />}
      <CorrectionsList corrections={corrections} />
      <ActionButton onClick={onOpenFullReceipt}>Ver la boleta completa o corregirla</ActionButton>
      {children}
    </div>
  );
}
