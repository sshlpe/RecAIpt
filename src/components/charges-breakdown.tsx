import { describeChargeLines } from "@/lib/receipt/charge-lines";
import type { ReceiptSummary } from "@/lib/receipt/summarize-receipt";
import { IconButton } from "./ui/icon-button";
import { PencilIcon } from "./ui/icons";
import { ReceiptLine, ReceiptPaper } from "./ui/receipt-paper";

interface ChargesBreakdownProps {
  summary: ReceiptSummary;
  /** Abre la corrección de los totales escritos (descuento, impuestos, propina, total). */
  onEdit: () => void;
}

/**
 * Cómo se arma el total a pagar, como un trozo de boleta: productos, descuento, impuestos
 * agregados y propina (solo las líneas que existen). Se muestra siempre, aunque no haya cargos:
 * el lápiz es donde se agrega un descuento que la lectura se saltó.
 */
export function ChargesBreakdown({ summary, onEdit }: ChargesBreakdownProps) {
  const { charges, payableTotal, formatAmount } = summary;

  return (
    <ReceiptPaper>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold">Cómo se arma el total</h2>
        <IconButton
          icon={<PencilIcon />}
          label="Corregir descuento y totales"
          variant="on-paper"
          small
          onClick={onEdit}
        />
      </div>
      <ul className="mt-4 space-y-2">
        <ReceiptLine label="Productos" value={formatAmount(charges.itemsSum)} />
        {describeChargeLines(charges).map((line) => (
          <ReceiptLine key={line.label} label={line.label} value={formatAmount(line.amount)} />
        ))}
        <ReceiptLine label="Total a pagar" value={formatAmount(payableTotal)} />
      </ul>
    </ReceiptPaper>
  );
}
