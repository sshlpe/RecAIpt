"use client";

import type { ChangeEvent } from "react";
import { actionButtonClassName, type ActionButtonVariant } from "./ui/action-button";
import { ImagePlusIcon } from "./ui/icons";

interface CaptureReceiptButtonProps {
  label: string;
  onPhotosSelected: (photos: File[]) => void;
  variant?: ActionButtonVariant;
  /** Botón redondo solo con ícono; `label` queda como nombre accesible y tooltip. */
  iconOnly?: boolean;
}

/**
 * Abre directamente la cámara trasera del teléfono. En escritorio abre el selector de archivos,
 * donde se pueden elegir varias fotos a la vez.
 */
export function CaptureReceiptButton({
  label,
  onPhotosSelected,
  variant,
  iconOnly = false,
}: CaptureReceiptButtonProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const photos = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (photos.length > 0) onPhotosSelected(photos);
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
        multiple
        className="sr-only"
        onChange={handleChange}
      />
    </label>
  );
}
