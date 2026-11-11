"use client";

import { useState, type ReactNode } from "react";
import type { ReceiptInfo } from "@/lib/receipt/editable-receipt";
import { receiptDateLabel, receiptTitle } from "@/lib/receipt/receipt-info";
import { ReceiptInfoForm } from "./receipt-info-form";
import { BottomSheet } from "./ui/bottom-sheet";
import { IconButton } from "./ui/icon-button";

interface ReceiptHeaderProps {
  info: ReceiptInfo;
  /** ISO: la fecha que se muestra si la boleta no trae una. */
  readAt: string;
  onSave: (info: ReceiptInfo) => void;
  /** Botones extra junto a "Editar" (ej: leer en voz alta). */
  actions?: ReactNode;
}

/** Título de la boleta (local y fecha), con su propio panel para corregirlos. */
export function ReceiptHeader({ info, readAt, onSave, actions }: ReceiptHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold break-words">{receiptTitle(info)}</h1>
        <p className="text-lg text-muted">{receiptDateLabel(info, readAt)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <IconButton
          icon="✎"
          label="Editar nombre y fecha"
          text="Editar"
          onClick={() => setIsEditing(true)}
        />
      </div>
      <BottomSheet open={isEditing} title="Nombre y fecha" onClose={() => setIsEditing(false)}>
        <ReceiptInfoForm
          initial={info}
          onSave={(next) => {
            onSave(next);
            setIsEditing(false);
          }}
        />
      </BottomSheet>
    </div>
  );
}
