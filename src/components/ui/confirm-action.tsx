"use client";

import { useState, type ReactNode } from "react";
import { ActionButton, type ActionButtonVariant } from "./action-button";

interface ConfirmActionProps {
  label: string;
  /** Qué se pierde: se muestra antes de confirmar. */
  warning: string;
  /** Control que confirma (un botón, o el selector de fotos). Recibe cómo cerrar la pregunta. */
  renderConfirm: (close: () => void) => ReactNode;
  /** Estilo del botón que ofrece la acción (ej: "danger-outline" para borrar). */
  variant?: ActionButtonVariant;
}

/** Acción que no se puede deshacer: pide confirmación en la misma pantalla, sin diálogos. */
export function ConfirmAction({
  label,
  warning,
  renderConfirm,
  variant = "secondary",
}: ConfirmActionProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const close = () => setIsConfirming(false);

  if (!isConfirming) {
    return (
      <ActionButton variant={variant} onClick={() => setIsConfirming(true)}>
        {label}
      </ActionButton>
    );
  }
  return (
    <div className="space-y-3 rounded-2xl border-2 border-border p-4">
      <p className="text-lg font-bold">{warning}</p>
      {renderConfirm(close)}
      <ActionButton variant="secondary" onClick={close}>
        Cancelar
      </ActionButton>
    </div>
  );
}
