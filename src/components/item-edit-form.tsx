"use client";

import { useState, type FormEvent } from "react";
import { getCurrencyDecimals } from "@/lib/format/currency";
import {
  QUANTITY_DECIMALS,
  formatNumberForInput,
  parseLocaleNumber,
  parseOptionalNumber,
} from "@/lib/format/format-numbers";
import type { ItemDraft } from "@/lib/receipt/editable-receipt";
import { InterpretedText } from "./interpreted-text";
import { ActionButton } from "./ui/action-button";
import { TextField } from "./ui/text-field";

interface ItemEditFormProps {
  initial: ItemDraft;
  currency: string;
  /** Texto crudo de la boleta, solo si la IA lo interpretó (para comparar al corregir). */
  interpretedText?: string | null;
  onSave: (draft: ItemDraft) => void;
  /** Si existe, se ofrece quitar el producto (no aplica al agregar uno nuevo). */
  onDelete?: () => void;
}

interface ItemFields {
  name: string;
  quantity: string;
  lineTotal: string;
  unitPrice: string;
}

function toFields(draft: ItemDraft, decimals: number): ItemFields {
  return {
    name: draft.name,
    quantity: formatNumberForInput(draft.quantity, QUANTITY_DECIMALS),
    lineTotal: formatNumberForInput(draft.lineTotal, decimals),
    unitPrice: formatNumberForInput(draft.unitPrice, decimals),
  };
}

/** Valida lo escrito: devuelve el producto o el mensaje de error a mostrar. */
function parseFields(fields: ItemFields, decimals: number): ItemDraft | string {
  const name = fields.name.trim();
  const quantity = parseLocaleNumber(fields.quantity, QUANTITY_DECIMALS);
  const lineTotal = parseLocaleNumber(fields.lineTotal, decimals);
  const unitPrice = parseOptionalNumber(fields.unitPrice, decimals);
  if (!name) return "Escribe el nombre del producto.";
  if (quantity === null || quantity <= 0) return "La cantidad debe ser un número mayor que 0.";
  if (lineTotal === null || lineTotal < 0) return "Escribe el total de la línea.";
  if (!unitPrice.isValid) return "El precio unitario no es un número válido.";
  return { name, quantity, lineTotal, unitPrice: unitPrice.value };
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [isConfirming, setIsConfirming] = useState(false);
  return (
    <ActionButton
      variant="secondary"
      onClick={() => (isConfirming ? onDelete() : setIsConfirming(true))}
    >
      {isConfirming ? "⚠ Toca de nuevo para quitarlo" : "🗑 Quitar producto"}
    </ActionButton>
  );
}

export function ItemEditForm({
  initial,
  currency,
  interpretedText = null,
  onSave,
  onDelete,
}: ItemEditFormProps) {
  const decimals = getCurrencyDecimals(currency);
  const [fields, setFields] = useState(() => toFields(initial, decimals));
  const [error, setError] = useState<string | null>(null);

  const setField = (key: keyof ItemFields) => (value: string) =>
    setFields((current) => ({ ...current, [key]: value }));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = parseFields(fields, decimals);
    if (typeof result === "string") return setError(result);
    onSave(result);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InterpretedText text={interpretedText} />
      <TextField
        label="Producto"
        value={fields.name}
        onChange={(event) => setField("name")(event.target.value)}
      />
      <TextField
        label="Cantidad"
        inputMode="decimal"
        value={fields.quantity}
        onChange={(event) => setField("quantity")(event.target.value)}
      />
      <TextField
        label="Total de la línea"
        inputMode="decimal"
        value={fields.lineTotal}
        onChange={(event) => setField("lineTotal")(event.target.value)}
      />
      <TextField
        label="Precio unitario (opcional)"
        hint="Déjalo vacío si la boleta no lo muestra."
        inputMode="decimal"
        value={fields.unitPrice}
        onChange={(event) => setField("unitPrice")(event.target.value)}
      />
      {error && (
        <p role="alert" className="text-lg font-bold text-warning">
          {error}
        </p>
      )}
      <ActionButton type="submit">Guardar</ActionButton>
      {onDelete && <DeleteButton onDelete={onDelete} />}
    </form>
  );
}
