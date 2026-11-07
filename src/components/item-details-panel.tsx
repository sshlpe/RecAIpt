import { hasMergedItems, type EditableItem } from "@/lib/receipt/editable-receipt";
import type { ItemIssue } from "@/lib/receipt/summarize-receipt";
import type { ItemActionHandlers } from "./item-actions";
import { ItemLineCard } from "./item-line-card";
import { IconButton } from "./ui/icon-button";

interface ItemDetailsPanelProps extends ItemActionHandlers {
  items: EditableItem[];
  currency: string;
  issuesByItemId: Map<string, ItemIssue>;
  /** Deshace "Combinar con otro producto" en este grupo. */
  onSplit: () => void;
}

/**
 * Contenido del popup al tocar una fila. El título del popup ya dice nombre y cantidad,
 * así que con una sola línea no se repiten; con varias, cada una muestra su monto.
 */
export function ItemDetailsPanel({
  items,
  currency,
  issuesByItemId,
  onSplit,
  ...handlers
}: ItemDetailsPanelProps) {
  if (items.length === 0) {
    return <p className="text-base text-muted">Este producto ya no está en la boleta.</p>;
  }
  const hasSeveralLines = items.length > 1;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemLineCard
          key={item.id}
          item={item}
          currency={currency}
          issue={issuesByItemId.get(item.id)}
          showHeading={hasSeveralLines}
          showAmount={hasSeveralLines}
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
