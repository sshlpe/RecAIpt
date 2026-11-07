import type { ButtonHTMLAttributes, ReactNode } from "react";
import { actionButtonClassName, type ActionButtonVariant } from "./action-button";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Emoji o ícono SVG (ver ./icons). */
  icon: ReactNode;
  /** Nombre accesible (lectores de pantalla) y tooltip; el ícono solo no basta. */
  label: string;
  /** Texto visible junto al ícono, opcional. */
  text?: string;
  variant?: ActionButtonVariant;
}

/** Botón de ícono (redondo si no lleva texto), con el mismo estilo base que los botones grandes. */
export function IconButton({
  icon,
  label,
  text,
  variant = "secondary",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={actionButtonClassName(variant, text ? "compact" : "icon")}
      {...props}
    >
      <span aria-hidden>{icon}</span>
      {text && <span>{text}</span>}
    </button>
  );
}
