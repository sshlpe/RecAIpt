import type { EditableItem } from "@/lib/receipt/editable-receipt";
import { toGroupingKey, type ItemGroup } from "@/lib/receipt/group-items";
import { IconButton } from "./ui/icon-button";

interface MergeGroupPickerProps {
  item: EditableItem;
  groups: ItemGroup<EditableItem>[];
  onMerge: (targetName: string) => void;
}

/** "Combinar con otro producto": lista los demás grupos para unir este con uno de ellos. */
export function MergeGroupPicker({ item, groups, onMerge }: MergeGroupPickerProps) {
  const ownKey = toGroupingKey(item.name);
  const otherGroups = groups.filter((group) => toGroupingKey(group.name) !== ownKey);
  if (otherGroups.length === 0) return null;

  return (
    <section className="space-y-3 border-t-2 border-surface pt-5">
      <h3 className="text-lg font-extrabold">Combinar con otro producto</h3>
      <p className="text-base text-muted">
        Si “{item.name}” es lo mismo que otro producto, únelos para verlos juntos.
      </p>
      <div className="flex flex-wrap gap-2">
        {otherGroups.map((group) => (
          <IconButton
            key={group.items[0].id}
            icon="🔗"
            text={group.name}
            label={`Combinar con ${group.name}`}
            onClick={() => onMerge(group.name)}
          />
        ))}
      </div>
    </section>
  );
}
