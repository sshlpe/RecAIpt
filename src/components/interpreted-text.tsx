/** "Leído como: “CC 350”": cómo se presenta en toda la app el texto crudo interpretado por la IA. */
export function describeInterpretedText(text: string): string {
  return `Leído como: “${text}”`;
}

/** Nota con el texto crudo; no muestra nada si la IA no lo interpretó (ver findInterpretedText). */
export function InterpretedText({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="text-base text-muted break-words">{describeInterpretedText(text)}</p>;
}
