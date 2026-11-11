import { formatQuantityLabel } from "@/lib/format/format-numbers";
import { hasMergedItems, type EditableItem } from "@/lib/receipt/editable-receipt";
import type { ItemGroup } from "@/lib/receipt/group-items";
import { findInterpretedText } from "@/lib/receipt/item-interpretation";
import type { ItemIssue } from "@/lib/receipt/summarize-receipt";
import { describeInterpretedText } from "./interpreted-text";
import { describeItemLine } from "./item-line-card";
import { PlusIcon } from "./ui/icons";
import { MoneyRow } from "./ui/money-row";

const REVIEW_FLAG = "Revisar";
const EDITED_BADGE = "Corregido";
const MERGED_BADGE = "Combinado";

/** Abre el popup de detalle de una o varias líneas, con `title` como encabezado. */
export type OpenItemDetails = (title: string, itemIds: string[]) => void;

interface ItemListProps {
  currency: string;
  issuesByItemId: Map<string, ItemIssue>;
  onOpenDetails: OpenItemDetails;
  onAddItem: () => void;
}

/** Última fila de la lista: agregar un producto que la lectura se saltó. */
function AddItemRow({ onAddItem }: { onAddItem: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onAddItem}
        className="flex w-full cursor-pointer items-center gap-3 px-3 py-4 text-left text-lg font-bold text-success"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-background"
        >
          <PlusIcon />
        </span>
        Agregar producto
      </button>
    </li>
  );
}

function interpretedDetail(item: EditableItem): string | null {
  const text = findInterpretedText(item);
  return text ? describeInterpretedText(text) : null;
}

/** Una corrección de montos pesa más que una combinación: se muestra esa. */
function groupBadge(items: EditableItem[]): string | null {
  if (items.some((item) => item.userEdited)) return EDITED_BADGE;
  return hasMergedItems(items) ? MERGED_BADGE : null;
}

function hasAnyIssue(items: EditableItem[], issuesByItemId: Map<string, ItemIssue>): boolean {
  return items.some((item) => issuesByItemId.has(item.id));
}

/** Vista agrupada: "5 × Coca-Cola". Al tocar un grupo se abre el detalle de sus líneas. */
export function GroupedItemList({
  groups,
  currency,
  issuesByItemId,
  onOpenDetails,
  onAddItem,
}: ItemListProps & { groups: ItemGroup<EditableItem>[] }) {
  return (
    <ul>
      {groups.map((group) => {
        const label = formatQuantityLabel(group.totalQuantity, group.name);
        return (
          <MoneyRow
            key={group.items[0].id}
            label={label}
            amount={group.totalAmount}
            currency={currency}
            detail={group.items.length > 1 ? `Aparece en ${group.items.length} líneas` : null}
            flag={hasAnyIssue(group.items, issuesByItemId) ? REVIEW_FLAG : null}
            badge={groupBadge(group.items)}
            onSelect={() =>
              onOpenDetails(
                label,
                group.items.map((item) => item.id),
              )
            }
          />
        );
      })}
      <AddItemRow onAddItem={onAddItem} />
    </ul>
  );
}

/** Vista línea por línea, como viene en la boleta. */
export function OriginalItemList({
  items,
  currency,
  issuesByItemId,
  onOpenDetails,
  onAddItem,
}: ItemListProps & { items: EditableItem[] }) {
  return (
    <ul>
      {items.map((item) => (
        <MoneyRow
          key={item.id}
          label={describeItemLine(item)}
          amount={item.lineTotal}
          currency={currency}
          detail={interpretedDetail(item)}
          flag={issuesByItemId.has(item.id) ? REVIEW_FLAG : null}
          badge={item.userEdited ? EDITED_BADGE : null}
          onSelect={() => onOpenDetails(describeItemLine(item), [item.id])}
        />
      ))}
      <AddItemRow onAddItem={onAddItem} />
    </ul>
  );
}
