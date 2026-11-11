"use client";

import { useCallback, useMemo, useState } from "react";
import { readReceiptPhotos } from "@/lib/api/analyze-receipt-client";
import { toErrorMessage } from "@/lib/errors/error-message";
import type { SavedReceipt } from "@/lib/history/saved-receipt";
import { discardReadingCorrections, toEditableReceipt } from "@/lib/receipt/editable-receipt";
import { findCorrections } from "@/lib/receipt/receipt-corrections";
import type { Receipt } from "@/lib/receipt/receipt-schema";
import { summarizeReceipt } from "@/lib/receipt/summarize-receipt";
import { useBillSplit } from "./use-bill-split";
import { useEditableReceipt } from "./use-editable-receipt";
import { useReceiptAutosave } from "./use-receipt-autosave";

export type RereadState =
  { status: "idle" } | { status: "reading" } | { status: "error"; message: string };

const UNKNOWN_ERROR_MESSAGE = "No se pudo reprocesar. Intenta otra vez.";

/**
 * Una boleta abierta (recién leída o del historial): lo que leyó la IA, las correcciones,
 * la división y lo que se deriva de ellas. Cada cambio se guarda solo en el dispositivo.
 */
export function useReceiptSession(saved: SavedReceipt) {
  const [original, setOriginal] = useState<Receipt>(saved.original);
  const { receipt, actions } = useEditableReceipt(saved.receipt);
  const billSplit = useBillSplit(saved.split);
  const [rereadState, setRereadState] = useState<RereadState>({ status: "idle" });
  const { replace } = actions;
  const resetSplit = billSplit.actions.reset;

  const current = useMemo<SavedReceipt>(
    () => ({ ...saved, original, receipt, split: billSplit.split }),
    [saved, original, receipt, billSplit.split],
  );
  useReceiptAutosave(current);

  const summary = useMemo(() => summarizeReceipt(receipt), [receipt]);
  const corrections = useMemo(() => findCorrections(original, receipt), [original, receipt]);

  /** Vuelve a lo que leyó la IA; nombre, fecha, propina y división se mantienen. */
  const resetToOriginal = useCallback(
    () => replace(discardReadingCorrections(receipt, original)),
    [replace, receipt, original],
  );

  /** "Reprocesar": la lectura nueva pasa a ser la original de ESTA boleta (no crea otra). */
  const reread = useCallback(
    async (photos: Blob[]) => {
      setRereadState({ status: "reading" });
      try {
        const { receipt: newReading } = await readReceiptPhotos(photos);
        setOriginal(newReading);
        replace(toEditableReceipt(newReading));
        resetSplit();
        setRereadState({ status: "idle" });
      } catch (error) {
        setRereadState({ status: "error", message: toErrorMessage(error, UNKNOWN_ERROR_MESSAGE) });
      }
    },
    [replace, resetSplit],
  );

  return {
    readAt: saved.readAt,
    receipt,
    actions,
    billSplit,
    summary,
    corrections,
    resetToOriginal,
    reread,
    rereadState,
  };
}

export type ReceiptSession = ReturnType<typeof useReceiptSession>;
