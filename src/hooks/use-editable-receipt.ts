"use client";

import { useMemo, useState } from "react";
import {
  addItem,
  confirmItem,
  mergeGroupInto,
  removeItem,
  setAddedTip,
  splitMergedItems,
  updateItem,
  updateLineTotal,
  updatePrintedTotals,
  updateReceiptInfo,
  type EditableReceipt,
  type ItemDraft,
  type PrintedTotals,
  type ReceiptInfo,
} from "@/lib/receipt/editable-receipt";
import type { TipChoice } from "@/lib/receipt/tip";

export interface EditableReceiptActions {
  saveItem: (itemId: string, draft: ItemDraft) => void;
  saveLineTotal: (itemId: string, lineTotal: number) => void;
  mergeGroup: (sourceName: string, targetName: string) => void;
  splitItems: (itemIds: string[]) => void;
  addItem: (draft: ItemDraft) => void;
  removeItem: (itemId: string) => void;
  confirmItem: (itemId: string) => void;
  saveTotals: (totals: PrintedTotals) => void;
  setTip: (tip: TipChoice | null) => void;
  saveInfo: (info: ReceiptInfo) => void;
  /** Reemplaza todo: volver a lo leído por la IA o una lectura nueva. */
  replace: (receipt: EditableReceipt) => void;
}

/**
 * Guarda las correcciones del usuario sobre la boleta (recién leída o abierta del historial).
 * Toda la lógica vive en funciones puras de `editable-receipt`; aquí solo hay estado.
 * Para empezar de cero con otra boleta, el componente se remonta con otra `key`.
 */
export function useEditableReceipt(initialReceipt: EditableReceipt) {
  const [receipt, setReceipt] = useState(initialReceipt);

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
      setTip: (tip) => setReceipt((current) => setAddedTip(current, tip)),
      saveInfo: (info) => setReceipt((current) => updateReceiptInfo(current, info)),
      replace: (next) => setReceipt(next),
    }),
    [],
  );

  return { receipt, actions };
}
