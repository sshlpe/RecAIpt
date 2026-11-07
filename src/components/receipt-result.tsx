"use client";

import { useMemo, useState } from "react";
import { useBillSplit } from "@/hooks/use-bill-split";
import { useEditableReceipt } from "@/hooks/use-editable-receipt";
import type { Receipt } from "@/lib/receipt/receipt-schema";
import { summarizeReceipt } from "@/lib/receipt/summarize-receipt";
import type { ItemActionHandlers } from "./item-actions";
import { GroupedItemList, OriginalItemList } from "./item-lists";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { ChargesBreakdown } from "./charges-breakdown";
import { ReceiptSheets, type ActiveSheet } from "./receipt-sheets";
import { SpeakButton } from "./speak-button";
import { SplitView } from "./split/split-view";
import { TipSelector } from "./tip-selector";
import { TotalBar } from "./total-bar";
import { IconButton } from "./ui/icon-button";
import { ImageIcon, PlusIcon } from "./ui/icons";
import { SegmentedToggle } from "./ui/segmented-toggle";
import { VerificationSummary } from "./verification-summary";

type ItemView = "grouped" | "original" | "split";

/** "Original" en vez de "Como en la boleta" para que entren tres opciones en un teléfono. */
const ITEM_VIEW_OPTIONS: { value: ItemView; label: string }[] = [
  { value: "grouped", label: "Agrupado" },
  { value: "original", label: "Original" },
  { value: "split", label: "Dividir" },
];

interface ReceiptResultProps {
  receipt: Receipt;
  photoUrls: string[];
  onNewReceipt: (photos: File[]) => void;
}

export function ReceiptResult({
  receipt: extractedReceipt,
  photoUrls,
  onNewReceipt,
}: ReceiptResultProps) {
  const { receipt, actions } = useEditableReceipt(extractedReceipt);
  const summary = useMemo(() => summarizeReceipt(receipt), [receipt]);
  const [itemView, setItemView] = useState<ItemView>("grouped");
  const [sheet, setSheet] = useState<ActiveSheet>(null);
  // La división vive aquí (no en la vista) para no perderla al cambiar de pestaña.
  const billSplit = useBillSplit();

  const itemHandlers: ItemActionHandlers = {
    onQuickEdit: (itemId) => setSheet({ kind: "quick-edit", itemId }),
    onAdvancedEdit: (itemId) => setSheet({ kind: "advanced-edit", itemId }),
    onConfirmItem: actions.confirmItem,
  };
  const listProps = {
    currency: summary.currency,
    issuesByItemId: summary.issuesByItemId,
    onOpenDetails: (title: string, itemIds: string[]) =>
      setSheet({ kind: "details", title, itemIds }),
  };
  const hasItems = receipt.items.length > 0;

  return (
    <div className="space-y-6">
      {!hasItems && <VerificationSummary message={summary.message} />}
      {hasItems && (
        <>
          <SpeakButton text={summary.spokenSummary} />
          <SegmentedToggle
            ariaLabel="Forma de ver los productos"
            options={ITEM_VIEW_OPTIONS}
            selected={itemView}
            onSelect={setItemView}
          />
          {itemView === "grouped" && <GroupedItemList groups={summary.groups} {...listProps} />}
          {itemView === "original" && <OriginalItemList items={receipt.items} {...listProps} />}
          <TipSelector
            printedTip={receipt.printedTip}
            addedTip={receipt.addedTip}
            tipAmount={summary.charges.tip}
            tipBase={summary.charges.itemsSum - summary.charges.discount}
            currency={summary.currency}
            formatAmount={summary.formatAmount}
            onChange={actions.setTip}
          />
          <ChargesBreakdown summary={summary} />
          {itemView === "split" && (
            <SplitView summary={summary} split={billSplit.split} actions={billSplit.actions} />
          )}
        </>
      )}
      <div className="flex items-center justify-center gap-4">
        <IconButton
          icon={<PlusIcon />}
          label="Agregar producto"
          variant="positive"
          onClick={() => setSheet({ kind: "add-item" })}
        />
        <IconButton
          icon={<ImageIcon />}
          label="Ver foto original"
          onClick={() => setSheet({ kind: "photo" })}
        />
        <CaptureReceiptButton
          label="Fotografiar otra boleta"
          variant="secondary"
          iconOnly
          onPhotosSelected={onNewReceipt}
        />
      </div>
      <TotalBar summary={summary} onOpenReview={() => setSheet({ kind: "review" })} />
      <ReceiptSheets
        sheet={sheet}
        onSheetChange={setSheet}
        receipt={receipt}
        photoUrls={photoUrls}
        summary={summary}
        actions={actions}
        itemHandlers={itemHandlers}
      />
    </div>
  );
}
