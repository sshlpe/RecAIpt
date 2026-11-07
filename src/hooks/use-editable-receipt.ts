"use client";

import { useMemo, useState } from "react";
import {
  addItem,
  confirmItem,
  mergeGroupInto,
  removeItem,
  splitMergedItems,
  toEditableReceipt,
  updateItem,
  updateLineTotal,
  updatePrintedTotals,
  type ItemDraft,
  type PrintedTotals,
} from "@/lib/receipt/editable-receipt";
import type { Receipt } from "@/lib/receipt/receipt-schema";

export interface EditableReceiptActions {
  saveItem: (itemId: string, draft: ItemDraft) => void;
  saveLineTotal: (itemId: string, lineTotal: number) => void;
  mergeGroup: (sourceName: string, targetName: string) => void;
  splitItems: (itemIds: string[]) => void;
  addItem: (draft: ItemDraft) => void;
  removeItem: (itemId: string) => void;
  confirmItem: (itemId: string) => void;
  saveTotals: (totals: PrintedTotals) => void;
}

/**
 * Guarda las correcciones del usuario sobre la boleta leída por la IA.
 * Toda la lógica vive en funciones puras de `editable-receipt`; aquí solo hay estado.
 * Para empezar de cero con otra boleta, el componente se remonta con otra `key`.
 */
export function useEditableReceipt(extractedReceipt: Receipt) {
  const [receipt, setReceipt] = useState(() => toEditableReceipt(extractedReceipt));

  const actions = useMemo<EditableReceiptActions>(
    () => ({
      saveItem: (itemId, draft) => setReceipt((current) => updateItem(current, itemId, draft)),
      saveLineTotal: (itemId, lineTotal) =>
        setReceipt((current) => updateLineTotal(current, itemId, lineTotal)),
      mergeGroup: (sourceName, targetName) =>
        setReceipt((current) => mergeGroupInto(current, sourceName, targetName)),
      splitItems: (itemIds) => setReceipt((current) => splitMergedItems(current, itemIds)),
      addItem: (draft) => setReceipt((current) => addItem(current, draft)),
      removeItem: (itemId) => setReceipt((current) => removeItem(current, itemId)),
      confirmItem: (itemId) => setReceipt((current) => confirmItem(current, itemId)),
      saveTotals: (totals) => setReceipt((current) => updatePrintedTotals(current, totals)),
    }),
    [],
  );

  return { receipt, actions };
}
