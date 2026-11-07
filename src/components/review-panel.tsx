import type { EditableItem } from "@/lib/receipt/editable-receipt";
import type { ReceiptSummary } from "@/lib/receipt/summarize-receipt";
import type { ItemActionHandlers } from "./item-actions";
import { ItemLineCard } from "./item-line-card";
import { ActionButton } from "./ui/action-button";
import { VerificationSummary } from "./verification-summary";

interface ReviewPanelProps extends ItemActionHandlers {
  summary: ReceiptSummary;
  items: EditableItem[];
  onEditTotals: () => void;
}

/** Detalle de la verificación y lista de líneas con dudas, con sus acciones. */
export function ReviewPanel({ summary, items, onEditTotals, ...handlers }: ReviewPanelProps) {
  const itemsToReview = items.filter((item) => summary.issuesByItemId.has(item.id));

  return (
    <div className="space-y-6">
      <VerificationSummary message={summary.message} />
      {itemsToReview.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-extrabold">Líneas para revisar</h3>
          {itemsToReview.map((item) => (
            <ItemLineCard
              key={item.id}
              item={item}
              currency={summary.currency}
              issue={summary.issuesByItemId.get(item.id)}
              {...handlers}
            />
          ))}
        </section>
      )}
      <ActionButton variant="secondary" onClick={onEditTotals}>
        ✏️ Corregir totales de la boleta
      </ActionButton>
    </div>
  );
}
