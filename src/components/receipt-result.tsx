"use client";

import { useMemo, useState } from "react";
import { useEditableReceipt } from "@/hooks/use-editable-receipt";
import type { Receipt } from "@/lib/receipt/receipt-schema";
import { summarizeReceipt } from "@/lib/receipt/summarize-receipt";
import type { ItemActionHandlers } from "./item-actions";
import { GroupedItemList, OriginalItemList } from "./item-lists";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { ReceiptSheets, type ActiveSheet } from "./receipt-sheets";
import { SpeakButton } from "./speak-button";
import { TotalBar } from "./total-bar";
import { IconButton } from "./ui/icon-button";
import { ImageIcon, PlusIcon } from "./ui/icons";
import { SegmentedToggle } from "./ui/segmented-toggle";
import { VerificationSummary } from "./verification-summary";

type ItemView = "grouped" | "original";

const ITEM_VIEW_OPTIONS: { value: ItemView; label: string }[] = [
  { value: "grouped", label: "Agrupado" },
  { value: "original", label: "Como en la boleta" },
];

interface ReceiptResultProps {
  receipt: Receipt;
  photoUrl: string;
  onNewPhoto: (photo: File) => void;
}

export function ReceiptResult({
  receipt: extractedReceipt,
  photoUrl,
  onNewPhoto,
}: ReceiptResultProps) {
  const { receipt, actions } = useEditableReceipt(extractedReceipt);
  const summary = useMemo(() => summarizeReceipt(receipt), [receipt]);
  const [itemView, setItemView] = useState<ItemView>("grouped");
  const [sheet, setSheet] = useState<ActiveSheet>(null);

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
          {itemView === "grouped" ? (
            <GroupedItemList groups={summary.groups} {...listProps} />
          ) : (
            <OriginalItemList items={receipt.items} {...listProps} />
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
          onPhotoSelected={onNewPhoto}
        />
      </div>
      <TotalBar summary={summary} onOpenReview={() => setSheet({ kind: "review" })} />
      <ReceiptSheets
        sheet={sheet}
        onSheetChange={setSheet}
        receipt={receipt}
        photoUrl={photoUrl}
        summary={summary}
        actions={actions}
        itemHandlers={itemHandlers}
      />
    </div>
  );
}
