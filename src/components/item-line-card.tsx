import { formatCurrency } from "@/lib/format/currency";
import { formatQuantity } from "@/lib/format/format-numbers";
import type { EditableItem } from "@/lib/receipt/editable-receipt";
import { findInterpretedText } from "@/lib/receipt/item-interpretation";
import type { ItemIssue } from "@/lib/receipt/summarize-receipt";
import { InterpretedText } from "./interpreted-text";
import { ItemActions, type ItemActionHandlers } from "./item-actions";

/** "2 × Coca-Cola": cómo se nombra una línea en toda la app. */
export function describeItemLine(item: EditableItem): string {
  return `${formatQuantity(item.quantity)} × ${item.name}`;
}

interface ItemLineCardProps extends ItemActionHandlers {
  item: EditableItem;
  currency: string;
  issue?: ItemIssue;
  /**
   * Dentro de una fila que ya muestra nombre y monto, no se repiten: solo el texto original.
   * El monto se muestra cuando la fila agrupa varias líneas (cada una tiene el suyo).
   */
  showHeading?: boolean;
  showAmount?: boolean;
}

/** Una línea de la boleta: texto original, (opcionalmente) nombre y monto, y sus acciones. */
export function ItemLineCard({
  item,
  currency,
  issue,
  showHeading = true,
  showAmount = true,
  ...handlers
}: ItemLineCardProps) {
  const isBare = !showHeading && !showAmount;
  const containerClass = isBare
    ? "space-y-3"
    : `space-y-3 rounded-2xl border-2 bg-background p-3 ${issue ? "border-warning" : "border-surface"}`;

  return (
    <div className={containerClass}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {showHeading && (
            <p className="text-lg font-semibold break-words">{describeItemLine(item)}</p>
          )}
          <InterpretedText text={findInterpretedText(item)} />
        </div>
        {showAmount && (
          <p className="shrink-0 text-base font-bold tabular-nums">
            {formatCurrency(item.lineTotal, currency)}
          </p>
        )}
      </div>
      <ItemActions itemId={item.id} issue={issue} {...handlers} />
    </div>
  );
}
