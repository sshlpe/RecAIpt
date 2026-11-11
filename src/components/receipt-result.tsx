"use client";

import { useState, type ReactNode } from "react";
import type { ReceiptSession } from "@/hooks/use-receipt-session";
import type { ItemActionHandlers } from "./item-actions";
import { GroupedItemList, OriginalItemList } from "./item-lists";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { ChargesBreakdown } from "./charges-breakdown";
import { ReceiptHeader } from "./receipt-header";
import { ReceiptOptions } from "./receipt-options";
import { ReceiptSheets, type ActiveSheet } from "./receipt-sheets";
import { SpeakButton } from "./speak-button";
import { SplitView } from "./split/split-view";
import { TipSelector } from "./tip-selector";
import { TotalBar } from "./total-bar";
import { IconButton } from "./ui/icon-button";
import { HistoryIcon, ImageIcon, PlusIcon } from "./ui/icons";
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
  /** Solo en la lectura recién hecha: el historial tiene su propia navegación. */
  onNewReceipt?: (photos: File[]) => void;
  onShowHistory?: () => void;
  /** Opciones extra al final (ej: borrar, en el historial). */
  extraOptions?: ReactNode;
}

export function ReceiptResult(props: ReceiptResultProps) {
  const { session, photoUrls, photos, onNewReceipt, onShowHistory, extraOptions } = props;
  const { receipt, actions, summary, billSplit } = session;
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
      <ReceiptHeader info={receipt} readAt={session.readAt} onSave={actions.saveInfo} />
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
            tipBase={summary.tipBase}
            hasDiscount={summary.charges.discount > 0}
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
        {photoUrls.length > 0 && (
          <IconButton
            icon={<ImageIcon />}
            label="Ver foto original"
            onClick={() => setSheet({ kind: "photo" })}
          />
        )}
        {onShowHistory && (
          <IconButton icon={<HistoryIcon />} label="Boletas anteriores" onClick={onShowHistory} />
        )}
        {onNewReceipt && (
          <CaptureReceiptButton
            label="Nueva boleta (otro gasto)"
            variant="secondary"
            iconOnly
            onPhotosSelected={onNewReceipt}
          />
        )}
      </div>
      <ReceiptOptions
        photos={photos}
        hasCorrections={session.corrections.length > 0}
        rereadState={session.rereadState}
        onReread={session.reread}
        onResetToOriginal={session.resetToOriginal}
      >
        {extraOptions}
      </ReceiptOptions>
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
