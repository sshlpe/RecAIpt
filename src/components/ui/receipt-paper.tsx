import type { ReactNode } from "react";

/** Trozo de boleta: papel térmico con el borde inferior cortado en zigzag (ver .receipt-paper). */
export function ReceiptPaper({ children }: { children: ReactNode }) {
  return <div className="receipt-paper rounded-t-2xl px-5 pt-6">{children}</div>;
}

interface ReceiptLineProps {
  label: string;
  value: string;
  /** Línea destacada (ej: el total final). */
  strong?: boolean;
}

/** Línea "impresa" con puntos guía, como en una boleta: "Letra grande ........ ✓". */
export function ReceiptLine({ label, value, strong = false }: ReceiptLineProps) {
  return (
    <li
      className={`flex items-baseline gap-2 font-mono ${strong ? "text-xl font-extrabold" : "text-lg"}`}
    >
      <span className="min-w-0 break-words">{label}</span>
      <span aria-hidden className="mb-1 flex-1 border-b-2 border-dotted border-ink-muted" />
      <span className="shrink-0 font-bold">{value}</span>
    </li>
  );
}
