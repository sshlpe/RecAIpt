"use client";

import { useState, type FormEvent } from "react";
import { getCurrencyDecimals } from "@/lib/format/currency";
import { formatNumberForInput, parseOptionalNumber } from "@/lib/format/format-numbers";
import { PRINTED_TOTAL_FIELDS, type PrintedTotals } from "@/lib/receipt/editable-receipt";
import { ActionButton } from "./ui/action-button";
import { TextField } from "./ui/text-field";

type TotalFields = Record<keyof PrintedTotals, string>;

interface TotalsEditFormProps {
  initial: PrintedTotals;
  currency: string;
  onSave: (totals: PrintedTotals) => void;
}

function toFields(totals: PrintedTotals, decimals: number): TotalFields {
  return Object.fromEntries(
    PRINTED_TOTAL_FIELDS.map(({ key }) => [key, formatNumberForInput(totals[key], decimals)]),
  ) as TotalFields;
}

/** Devuelve los totales o el nombre del primer campo inválido. */
function parseFields(fields: TotalFields, decimals: number): PrintedTotals | string {
  const totals = {} as PrintedTotals;
  for (const { key, label } of PRINTED_TOTAL_FIELDS) {
    const parsed = parseOptionalNumber(fields[key], decimals);
    if (!parsed.isValid) return label;
    totals[key] = parsed.value;
  }
  return totals;
}

/** Corrige los montos escritos al pie de la boleta. Vacío = no aparece en la boleta. */
export function TotalsEditForm({ initial, currency, onSave }: TotalsEditFormProps) {
  const decimals = getCurrencyDecimals(currency);
  const [fields, setFields] = useState(() => toFields(initial, decimals));
  const [invalidField, setInvalidField] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = parseFields(fields, decimals);
    if (typeof result === "string") return setInvalidField(result);
    onSave(result);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-lg text-muted">
        Escribe los montos tal como aparecen en la boleta. Deja vacío lo que no aparece.
      </p>
      {PRINTED_TOTAL_FIELDS.map(({ key, label }) => (
        <TextField
          key={key}
          label={label}
          inputMode="decimal"
          value={fields[key]}
          onChange={(event) => setFields((current) => ({ ...current, [key]: event.target.value }))}
        />
      ))}
      {invalidField && (
        <p role="alert" className="text-lg font-bold text-warning">
          {invalidField}: no es un número válido.
        </p>
      )}
      <ActionButton type="submit">Guardar</ActionButton>
    </form>
  );
}
