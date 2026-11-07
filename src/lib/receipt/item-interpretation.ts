import { ADDED_ITEM_ORIGINAL_TEXT, type EditableItem } from "./editable-receipt";
import { toGroupingKey } from "./group-items";

/** Palabras de 1-2 letras (de, y, la, a) no cambian el significado: "Tinto de Verano". */
const MIN_MEANINGFUL_WORD_LENGTH = 3;

/** Palabras con significado, sin números (cantidades, precios, tamaños) ni signos. */
function toWordSet(text: string): Set<string> {
  const words = toGroupingKey(text)
    .split(/[^\p{L}\d]+/u)
    .filter((word) => word.length >= MIN_MEANINGFUL_WORD_LENGTH && !/\d/.test(word));
  return new Set(words);
}

function haveSameWords(first: Set<string>, second: Set<string>): boolean {
  return first.size === second.size && [...first].every((word) => second.has(word));
}

/**
 * El texto crudo de la boleta, solo si la IA lo interpretó (ej: "CC 350" -> "Coca-Cola 350",
 * "Mixta" -> "Ensalada mixta"). Si dice lo mismo que el nombre, no aporta y se omite.
 */
export function findInterpretedText(item: EditableItem): string | null {
  if (item.originalText === ADDED_ITEM_ORIGINAL_TEXT) return null;
  const isSameAsName = haveSameWords(toWordSet(item.originalText), toWordSet(item.name));
  return isSameAsName ? null : item.originalText;
}
