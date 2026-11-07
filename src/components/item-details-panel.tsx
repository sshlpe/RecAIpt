import { hasMergedItems, type EditableItem } from "@/lib/receipt/editable-receipt";
import type { ItemIssue } from "@/lib/receipt/summarize-receipt";
import { IssueNote, ItemActionButtons, type ItemActionHandlers } from "./item-actions";
import { ItemLineCard } from "./item-line-card";
import { QuickAmountForm } from "./quick-amount-form";
import { IconButton } from "./ui/icon-button";

interface ItemDetailsPanelProps extends ItemActionHandlers {
  items: EditableItem[];
  currency: string;
  issuesByItemId: Map<string, ItemIssue>;
  /** Deshace "Combinar con otro producto" en este grupo. */
  onSplit: () => void;
  /** Guarda el monto corregido de una línea (edición directa en el detalle). */
  onSaveAmount: (itemId: string, lineTotal: number) => void;
}

/**
 * Una sola línea: lo más común es corregir el monto, así que el campo aparece directo
 * (sin foco, para que el teclado no tape la información) y lo avanzado queda en ⚙️.
 */
function SingleItemDetails({
  item,
  currency,
  issue,
  onSaveAmount,
  ...handlers
}: ItemActionHandlers & {
  item: EditableItem;
  currency: string;
  issue?: ItemIssue;
  onSaveAmount: ItemDetailsPanelProps["onSaveAmount"];
}) {
  return (
    <div className="space-y-4">
      <IssueNote issue={issue} />
      <QuickAmountForm
        item={item}
        currency={currency}
        showHeading={false}
        autoFocus={false}
        onSave={(lineTotal) => onSaveAmount(item.id, lineTotal)}
      />
      <ItemActionButtons itemId={item.id} issue={issue} showQuickEdit={false} {...handlers} />
    </div>
  );
}

/**
 * Contenido del popup al tocar una fila. El título del popup ya dice nombre y cantidad,
 * así que con una sola línea no se repiten; con varias, cada una muestra su monto y su ✏️.
 */
export function ItemDetailsPanel({
  items,
  currency,
  issuesByItemId,
  onSplit,
  onSaveAmount,
  ...handlers
}: ItemDetailsPanelProps) {
  if (items.length === 0) {
    return <p className="text-base text-muted">Este producto ya no está en la boleta.</p>;
  }
  const hasSeveralLines = items.length > 1;
  if (!hasSeveralLines) {
    return (
      <SingleItemDetails
        item={items[0]}
        currency={currency}
        issue={issuesByItemId.get(items[0].id)}
        onSaveAmount={onSaveAmount}
        {...handlers}
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemLineCard
          key={item.id}
          item={item}
          currency={currency}
          issue={issuesByItemId.get(item.id)}
          showHeading
          showAmount
          {...handlers}
        />
      ))}
      {hasMergedItems(items) && (
        <div className="border-t-2 border-surface pt-4">
          <IconButton
            icon="↩"
            text="Separar productos combinados"
            label="Separar productos combinados"
            onClick={onSplit}
          />
        </div>
      )}
    </div>
  );
}
