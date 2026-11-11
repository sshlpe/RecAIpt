"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ReceiptSession } from "@/hooks/use-receipt-session";
import { buildSpokenReceipt } from "@/lib/receipt/build-spoken-summary";
import type { ItemActionHandlers } from "./item-actions";
import { GroupedItemList, OriginalItemList } from "./item-lists";
import { ChargesBreakdown } from "./charges-breakdown";
import { ReceiptHeader } from "./receipt-header";
import { ReceiptOptions } from "./receipt-options";
import { ReceiptSheets, type ActiveSheet } from "./receipt-sheets";
import { SpeakButton } from "./speak-button";
import { SplitView } from "./split/split-view";
import { TipSelector } from "./tip-selector";
import { TotalBar } from "./total-bar";
import { ActionButton } from "./ui/action-button";
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
  /** Boleta abierta (recién leída o del historial); cada cambio se guarda solo. */
  session: ReceiptSession;
  /** Fotos de la lectura recién hecha; vacías en una boleta del historial (no se guardan). */
  photoUrls: string[];
  photos: File[];
  /** Opciones extra al final (ej: borrar, en el historial). */
  extraOptions?: ReactNode;
}

export function ReceiptResult(props: ReceiptResultProps) {
  const { session, photoUrls, photos, extraOptions } = props;
  const { receipt, actions, summary, billSplit } = session;
  const spokenReceipt = useMemo(
    () => buildSpokenReceipt(receipt, session.readAt, summary),
    [receipt, session.readAt, summary],
  );
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
    onAddItem: () => setSheet({ kind: "add-item" }),
  };
  const hasItems = receipt.items.length > 0;

  return (
    <div className="space-y-6">
      <ReceiptHeader
        info={receipt}
        readAt={session.readAt}
        onSave={actions.saveInfo}
        actions={hasItems && <SpeakButton segments={spokenReceipt} />}
      />
      {!hasItems && (
        <>
          <VerificationSummary message={summary.message} />
          <ActionButton variant="secondary" onClick={listProps.onAddItem}>
            Agregar producto
          </ActionButton>
        </>
      )}
      {hasItems && (
        <>
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
            tipBase={summary.tipBase}
            hasDiscount={summary.charges.discount > 0}
            currency={summary.currency}
            formatAmount={summary.formatAmount}
            onChange={actions.setTip}
          />
          <ChargesBreakdown summary={summary} onEdit={() => setSheet({ kind: "edit-totals" })} />
          {itemView === "split" && (
            <SplitView summary={summary} split={billSplit.split} actions={billSplit.actions} />
          )}
        </>
      )}
      <ReceiptOptions
        photos={photos}
        hasCorrections={session.corrections.length > 0}
        rereadState={session.rereadState}
        onReread={session.reread}
        onResetToOriginal={session.resetToOriginal}
      >
        {extraOptions}
      </ReceiptOptions>
      <TotalBar
        summary={summary}
        onOpenReview={() => setSheet({ kind: "review" })}
        onShowPhotos={photoUrls.length > 0 ? () => setSheet({ kind: "photo" }) : undefined}
      />
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
