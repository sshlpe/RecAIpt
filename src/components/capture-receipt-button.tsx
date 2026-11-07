"use client";

import type { ChangeEvent } from "react";
import { actionButtonClassName, type ActionButtonVariant } from "./ui/action-button";
import { ImagePlusIcon } from "./ui/icons";

interface CaptureReceiptButtonProps {
  label: string;
  onPhotoSelected: (photo: File) => void;
  variant?: ActionButtonVariant;
  /** Botón redondo solo con ícono; `label` queda como nombre accesible y tooltip. */
  iconOnly?: boolean;
}

/** Abre directamente la cámara trasera del teléfono (en escritorio, el selector de archivos). */
export function CaptureReceiptButton({
  label,
  onPhotoSelected,
  variant,
  iconOnly = false,
}: CaptureReceiptButtonProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const photo = event.target.files?.[0];
    event.target.value = "";
    if (photo) onPhotoSelected(photo);
  }

  return (
    <label
      title={iconOnly ? label : undefined}
      className={actionButtonClassName(variant, iconOnly ? "icon" : "large")}
    >
      <ImagePlusIcon />
      <span className={iconOnly ? "sr-only" : undefined}>{label}</span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleChange}
      />
    </label>
  );
}
