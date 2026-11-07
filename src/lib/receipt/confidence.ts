import type { ConfidenceLevel } from "./receipt-schema";

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = { high: 2, medium: 1, low: 0 };

/** Devuelve la confianza más baja de la lista (un grupo es tan confiable como su peor línea). */
export function lowestConfidence(levels: ConfidenceLevel[]): ConfidenceLevel {
  return levels.reduce<ConfidenceLevel>(
    (lowest, level) => (CONFIDENCE_RANK[level] < CONFIDENCE_RANK[lowest] ? level : lowest),
    "high",
  );
}

export function isDoubtful(level: ConfidenceLevel): boolean {
  return level !== "high";
}
