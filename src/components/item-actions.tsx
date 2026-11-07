import type { ItemIssue } from "@/lib/receipt/summarize-receipt";
import { IconButton } from "./ui/icon-button";

export interface ItemActionHandlers {
  /** Lápiz: corregir solo el monto. */
  onQuickEdit: (itemId: string) => void;
  /** Engranaje: nombre, cantidad, combinar con otro producto o quitarlo. */
  onAdvancedEdit: (itemId: string) => void;
  onConfirmItem: (itemId: string) => void;
}

interface ItemActionsProps extends ItemActionHandlers {
  itemId: string;
  issue?: ItemIssue;
}

/** Qué pasó con la línea (si hay duda) y los botones compactos para corregirla o confirmarla. */
export function ItemActions({
  itemId,
  issue,
  onQuickEdit,
  onAdvancedEdit,
  onConfirmItem,
}: ItemActionsProps) {
  return (
    <div className="space-y-3">
      {issue && (
        <p className="rounded-xl border-2 border-warning bg-background p-3 text-base">
          <span className="font-bold text-warning">⚠ </span>
          {issue.message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <IconButton icon="✏️" label="Corregir monto" onClick={() => onQuickEdit(itemId)} />
        <IconButton icon="⚙️" label="Edición avanzada" onClick={() => onAdvancedEdit(itemId)} />
        {issue?.canDismiss && (
          <IconButton
            icon="✓"
            text="Está bien"
            label="Está bien: la lectura es correcta"
            onClick={() => onConfirmItem(itemId)}
          />
        )}
      </div>
    </div>
  );
}
