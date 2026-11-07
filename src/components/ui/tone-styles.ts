/** Colores por tono, compartidos por todos los componentes que muestran un estado. */

export type Tone = "success" | "warning" | "info";

export const TONE_SURFACE_CLASS: Record<Tone, string> = {
  success: "border-success bg-success-surface",
  warning: "border-warning bg-warning-surface",
  info: "border-info bg-info-surface",
};

export const TONE_TEXT_CLASS: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
};

export const TONE_ICON: Record<Tone, string> = {
  success: "✓",
  warning: "⚠",
  info: "ℹ",
};
