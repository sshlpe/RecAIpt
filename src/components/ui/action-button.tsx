import type { ButtonHTMLAttributes } from "react";

export type ActionButtonVariant = "primary" | "secondary" | "positive";
export type ActionButtonSize = "large" | "compact" | "icon";

const BASE_CLASS =
  "flex items-center justify-center gap-2 font-bold cursor-pointer select-none " +
  "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const SIZE_CLASS: Record<ActionButtonSize, string> = {
  large: "w-full min-h-14 rounded-2xl px-5 py-3 text-lg",
  compact: "min-h-11 rounded-xl px-4 py-2 text-base",
  /** Solo ícono: círculo de 48 px (área táctil cómoda). */
  icon: "h-12 w-12 shrink-0 rounded-full",
};

const VARIANT_CLASS: Record<ActionButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground",
  secondary: "border-2 border-border bg-background text-foreground",
  /** Acciones de agregar: verde, con el texto del color del fondo para mantener contraste. */
  positive: "bg-success text-background",
};

/**
 * Estilo de botón, reutilizable también en elementos que no son <button> (ej: <label>).
 * El tamaño es un parámetro y no una clase extra: en Tailwind, sobrescribir clases en
 * conflicto (w-full vs w-auto) depende del orden del CSS generado, no del atributo.
 */
export function actionButtonClassName(
  variant: ActionButtonVariant = "primary",
  size: ActionButtonSize = "large",
): string {
  return `${BASE_CLASS} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]}`;
}

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
}

/** Sin `className`: el estilo se controla solo con `variant`, para que no haya clases en conflicto. */
export function ActionButton({
  variant = "primary",
  ...props
}: Omit<ActionButtonProps, "className">) {
  return <button type="button" className={actionButtonClassName(variant)} {...props} />;
}
