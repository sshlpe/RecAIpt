import { sumBy } from "./sum-by";

/**
 * Redondea cada valor a `decimals` decimales sin que la suma cambie (método del mayor resto):
 * se trunca cada uno y las unidades que faltan van a los de mayor parte fraccionaria.
 * Ej: [3333.33, 3333.33, 3333.34] con 0 decimales -> [3333, 3333, 3334] (suma 10000).
 */
export function distributeRounded(values: number[], decimals: number): number[] {
  const factor = 10 ** decimals;
  const scaled = values.map((value) => value * factor);
  const truncated = scaled.map(Math.floor);
  let missingUnits = Math.round(sumBy(scaled, (value) => value)) - sumBy(truncated, (v) => v);

  const byLargestRemainder = scaled
    .map((value, index) => ({ index, remainder: value - truncated[index] }))
    .sort((first, second) => second.remainder - first.remainder);
  for (const { index } of byLargestRemainder) {
    if (missingUnits <= 0) break;
    truncated[index] += 1;
    missingUnits -= 1;
  }
  return truncated.map((units) => units / factor);
}
