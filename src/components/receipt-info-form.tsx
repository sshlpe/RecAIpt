"use client";

import { useState, type FormEvent } from "react";
import type { ReceiptInfo } from "@/lib/receipt/editable-receipt";
import { toDateInputValue } from "@/lib/receipt/receipt-info";
import { ActionButton } from "./ui/action-button";
import { TextField } from "./ui/text-field";

interface ReceiptInfoFormProps {
  initial: ReceiptInfo;
  onSave: (info: ReceiptInfo) => void;
}

/** Nombre del local y fecha. La fecha usa el selector del teléfono: nada que escribir a mano. */
export function ReceiptInfoForm({ initial, onSave }: ReceiptInfoFormProps) {
  const [name, setName] = useState(initial.merchantName ?? "");
  const [date, setDate] = useState(() => toDateInputValue(initial));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ merchantName: name, purchaseDate: date });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Nombre del local"
        hint='Si lo dejas vacío, se muestra "Boleta".'
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        label="Fecha"
        type="date"
        hint="Si la dejas vacía, se usa el día en que se leyó."
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
      <ActionButton type="submit">Guardar</ActionButton>
    </form>
  );
}
