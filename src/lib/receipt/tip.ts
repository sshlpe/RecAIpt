import { roundToCurrency } from "@/lib/format/currency";

/** Propina agregada por el usuario cuando la boleta no la trae. */
export type TipChoice = { kind: "percent"; percent: number } | { kind: "amount"; amount: number };

/** "Sin propina" explícito: distinto de null, que significa "usar la de la boleta". */
export const NO_TIP: TipChoice = { kind: "amount", amount: 0 };

/** El número que escribió el usuario, sea porcentaje o monto. */
export function tipChoiceValue(choice: TipChoice): number {
  return choice.kind === "percent" ? choice.percent : choice.amount;
}

/** Porcentajes ofrecidos (en Chile la propina sugerida es 10%). */
export const TIP_PERCENT_PRESETS = [10, 15] as const;

/** Porcentaje que representa un monto de propina sobre la base, con un decimal (500/8690 -> 5.8). */
export function tipPercentOf(amount: number, base: number): number | null {
  if (base <= 0) return null;
  return Math.round((amount / base) * 1000) / 10;
}

/**
 * Base sobre la que se calcula un porcentaje de propina: el consumo bruto, ANTES de descuentos e
 * impuestos agregados. Así lo hacen los locales (ej: descuentos por pagar con cierta tarjeta).
 */
export function tipBase(itemsSum: number): number {
  return itemsSum;
}

/** Monto de la propina; un porcentaje se calcula sobre la base (ver `tipBase`). */
export function calculateTipAmount(choice: TipChoice, base: number, currency: string): number {
  if (choice.kind === "amount") return choice.amount;
  return roundToCurrency((base * choice.percent) / 100, currency);
}
