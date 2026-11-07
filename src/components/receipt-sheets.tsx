"use client";

import type { EditableReceiptActions } from "@/hooks/use-editable-receipt";
import { findItem, type EditableReceipt, type ItemDraft } from "@/lib/receipt/editable-receipt";
import { findInterpretedText } from "@/lib/receipt/item-interpretation";
import type { ReceiptSummary } from "@/lib/receipt/summarize-receipt";
import type { ItemActionHandlers } from "./item-actions";
import { ItemDetailsPanel } from "./item-details-panel";
import { ItemEditForm } from "./item-edit-form";
import { MergeGroupPicker } from "./merge-group-picker";
import { OriginalPhoto } from "./original-photo";
import { QuickAmountForm } from "./quick-amount-form";
import { ReviewPanel } from "./review-panel";
import { TotalsEditForm } from "./totals-edit-form";
import { BottomSheet } from "./ui/bottom-sheet";

export type ActiveSheet =
  | { kind: "review" }
  | { kind: "details"; title: string; itemIds: string[] }
  | { kind: "quick-edit"; itemId: string }
  | { kind: "advanced-edit"; itemId: string }
  | { kind: "add-item" }
  | { kind: "edit-totals" }
  | { kind: "photo" }
  | null;

type SheetKind = NonNullable<ActiveSheet>["kind"];

/** Títulos fijos; el detalle de un producto usa el nombre de la fila tocada. */
const SHEET_TITLES: Record<Exclude<SheetKind, "details">, string> = {
  review: "Detalle de la cuenta",
  "quick-edit": "Corregir monto",
  "advanced-edit": "Edición avanzada",
  "add-item": "Agregar producto",
  "edit-totals": "Totales de la boleta",
  photo: "Foto de la boleta",
};

const EMPTY_ITEM: ItemDraft = { name: "", quantity: 1, unitPrice: null, lineTotal: 0 };

interface ReceiptSheetsProps {
  sheet: ActiveSheet;
  onSheetChange: (sheet: ActiveSheet) => void;
  receipt: EditableReceipt;
  photoUrl: string;
  summary: ReceiptSummary;
  actions: EditableReceiptActions;
  itemHandlers: ItemActionHandlers;
}

function SheetContent({
  sheet,
  onSheetChange,
  receipt,
  photoUrl,
  summary,
  actions,
  itemHandlers,
}: ReceiptSheetsProps) {
  const close = () => onSheetChange(null);
  const { currency } = summary;

  switch (sheet?.kind) {
    case "review":
      return (
        <ReviewPanel
          summary={summary}
          items={receipt.items}
          onEditTotals={() => onSheetChange({ kind: "edit-totals" })}
          {...itemHandlers}
        />
      );
    case "details":
      return (
        <ItemDetailsPanel
          items={sheet.itemIds.flatMap((itemId) => findItem(receipt, itemId) ?? [])}
          currency={currency}
          issuesByItemId={summary.issuesByItemId}
          onSplit={() => (actions.splitItems(sheet.itemIds), close())}
          {...itemHandlers}
        />
      );
    case "quick-edit": {
      const item = findItem(receipt, sheet.itemId);
      if (!item) return null;
      return (
        <QuickAmountForm
          item={item}
          currency={currency}
          onSave={(lineTotal) => (actions.saveLineTotal(item.id, lineTotal), close())}
        />
      );
    }
    case "advanced-edit": {
      const item = findItem(receipt, sheet.itemId);
      if (!item) return null;
      return (
        <div className="space-y-6">
          <ItemEditForm
            initial={item}
            currency={currency}
            interpretedText={findInterpretedText(item)}
            onSave={(draft) => (actions.saveItem(item.id, draft), close())}
            onDelete={() => (actions.removeItem(item.id), close())}
          />
          <MergeGroupPicker
            item={item}
            groups={summary.groups}
            onMerge={(targetName) => (actions.mergeGroup(item.name, targetName), close())}
          />
        </div>
      );
    }
    case "add-item":
      return (
        <ItemEditForm
          initial={EMPTY_ITEM}
          currency={currency}
          onSave={(draft) => (actions.addItem(draft), close())}
        />
      );
    case "edit-totals":
      return (
        <TotalsEditForm
          initial={receipt}
          currency={currency}
          onSave={(totals) => (actions.saveTotals(totals), close())}
        />
      );
    case "photo":
      return <OriginalPhoto photoUrl={photoUrl} />;
    default:
      return null;
  }
}

function sheetTitle(sheet: ActiveSheet): string {
  if (!sheet) return "";
  return sheet.kind === "details" ? sheet.title : SHEET_TITLES[sheet.kind];
}

/** Una sola hoja inferior cuyo contenido depende de qué se está revisando o editando. */
export function ReceiptSheets(props: ReceiptSheetsProps) {
  const { sheet, onSheetChange } = props;
  return (
    <BottomSheet
      open={sheet !== null}
      title={sheetTitle(sheet)}
      onClose={() => onSheetChange(null)}
    >
      <SheetContent {...props} />
    </BottomSheet>
  );
}
