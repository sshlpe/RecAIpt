import type { ReceiptSummary } from "@/lib/receipt/summarize-receipt";
import { ReceiptLine, ReceiptPaper } from "./ui/receipt-paper";

/**
 * Cómo se arma el total a pagar, como un trozo de boleta: productos, descuento, impuestos
 * agregados y propina. Solo aparece si hay algo además de los productos (si no, repetiría
 * el total) y solo muestra las líneas que existen.
 */
export function ChargesBreakdown({ summary }: { summary: ReceiptSummary }) {
  const { charges, payableTotal, formatAmount } = summary;
  const extraLines = [
    { label: "Descuento", amount: -charges.discount },
    { label: "Impuestos aparte", amount: charges.taxes },
    { label: "Propina", amount: charges.tip },
  ].filter((line) => line.amount !== 0);
  if (extraLines.length === 0) return null;

  return (
    <ReceiptPaper>
      <h2 className="text-xl font-extrabold">Cómo se arma el total</h2>
      <ul className="mt-4 space-y-2">
        <ReceiptLine label="Productos" value={formatAmount(charges.itemsSum)} />
        {extraLines.map((line) => (
          <ReceiptLine key={line.label} label={line.label} value={formatAmount(line.amount)} />
        ))}
        <ReceiptLine label="Total a pagar" value={formatAmount(payableTotal)} />
      </ul>
    </ReceiptPaper>
  );
}
