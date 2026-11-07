import { roundToCurrency } from "@/lib/format/currency";

/** Propina agregada por el usuario cuando la boleta no la trae. */
export type TipChoice = { kind: "percent"; percent: number } | { kind: "amount"; amount: number };

/** Porcentajes ofrecidos (en Chile la propina sugerida es 10%). */
export const TIP_PERCENT_PRESETS = [10, 15] as const;

/** Porcentaje que representa un monto de propina sobre la base, con un decimal (500/8690 -> 5.8). */
export function tipPercentOf(amount: number, base: number): number | null {
  if (base <= 0) return null;
  return Math.round((amount / base) * 1000) / 10;
}

/** Monto de la propina; un porcentaje se calcula sobre el consumo menos descuentos. */
export function calculateTipAmount(choice: TipChoice, base: number, currency: string): number {
  if (choice.kind === "amount") return choice.amount;
  return roundToCurrency((base * choice.percent) / 100, currency);
}
