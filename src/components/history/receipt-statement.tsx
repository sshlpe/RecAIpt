import { formatQuantityLabel } from "@/lib/format/format-numbers";
import { describeChargeLines } from "@/lib/receipt/charge-lines";
import type { ReceiptSummary } from "@/lib/receipt/summarize-receipt";
import { ReceiptLine, ReceiptPaper } from "../ui/receipt-paper";

/**
 * La boleta final en limpio, solo lectura: productos agrupados, lo que se suma o resta
 * (descuento, impuestos, propina) y el total que quedó.
 */
export function ReceiptStatement({ summary }: { summary: ReceiptSummary }) {
  const { groups, charges, payableTotal, formatAmount } = summary;

  return (
    <ReceiptPaper>
      <h2 className="text-xl font-extrabold">Boleta final</h2>
      <ul className="mt-4 space-y-2" aria-label="Productos">
        {groups.map((group) => (
          <ReceiptLine
            key={group.items[0].id}
            label={formatQuantityLabel(group.totalQuantity, group.name)}
            value={formatAmount(group.totalAmount)}
          />
        ))}
      </ul>
      <ul className="mt-4 space-y-2 border-t-2 border-dashed border-ink-muted pt-4">
        {describeChargeLines(charges).map((line) => (
          <ReceiptLine key={line.label} label={line.label} value={formatAmount(line.amount)} />
        ))}
        <ReceiptLine label="Total final" value={formatAmount(payableTotal)} strong />
      </ul>
    </ReceiptPaper>
  );
}
