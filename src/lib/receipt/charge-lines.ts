import type { SplitCharges } from "@/lib/split/compute-split";

export interface ChargeLine {
  label: string;
  amount: number;
}

/** Lo que se suma o resta a los productos (el descuento, en negativo); solo lo que existe. */
export function describeChargeLines(charges: SplitCharges): ChargeLine[] {
  return [
    { label: "Descuento", amount: -charges.discount },
    { label: "Impuestos aparte", amount: charges.taxes },
    { label: "Propina", amount: charges.tip },
  ].filter((line) => line.amount !== 0);
}
