"use client";

import { useState, type FormEvent } from "react";
import { getCurrencyDecimals } from "@/lib/format/currency";
import { formatNumberForInput, parseLocaleNumber } from "@/lib/format/format-numbers";
import type { EditableItem } from "@/lib/receipt/editable-receipt";
import { findInterpretedText } from "@/lib/receipt/item-interpretation";
import { InterpretedText } from "./interpreted-text";
import { describeItemLine } from "./item-line-card";
import { ActionButton } from "./ui/action-button";
import { TextField } from "./ui/text-field";

interface QuickAmountFormProps {
  item: EditableItem;
  currency: string;
  onSave: (lineTotal: number) => void;
  /** Nombre de la línea arriba del campo; se omite si el título del popup ya lo dice. */
  showHeading?: boolean;
  /** Abrir el teclado al mostrarse (desde el ✏️ sí; en el detalle del producto, no). */
  autoFocus?: boolean;
}

/** Edición rápida: un solo campo con el monto de la línea. */
export function QuickAmountForm({
  item,
  currency,
  onSave,
  showHeading = true,
  autoFocus = true,
}: QuickAmountFormProps) {
  const decimals = getCurrencyDecimals(currency);
  const [value, setValue] = useState(() => formatNumberForInput(item.lineTotal, decimals));
  const [hasError, setHasError] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const lineTotal = parseLocaleNumber(value, decimals);
    if (lineTotal === null || lineTotal < 0) return setHasError(true);
    onSave(lineTotal);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        {showHeading && <p className="text-lg font-semibold">{describeItemLine(item)}</p>}
        <InterpretedText text={findInterpretedText(item)} />
      </div>
      <TextField
        label="Monto de la línea"
        inputMode="decimal"
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {hasError && (
        <p role="alert" className="text-base font-bold text-warning">
          Escribe un monto válido.
        </p>
      )}
      <ActionButton type="submit">Guardar</ActionButton>
    </form>
  );
}
