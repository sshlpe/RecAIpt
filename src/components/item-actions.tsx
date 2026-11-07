import type { ItemIssue } from "@/lib/receipt/summarize-receipt";
import { IconButton } from "./ui/icon-button";

export interface ItemActionHandlers {
  /** Lápiz: corregir solo el monto. */
  onQuickEdit: (itemId: string) => void;
  /** Engranaje: nombre, cantidad, combinar con otro producto o quitarlo. */
  onAdvancedEdit: (itemId: string) => void;
  onConfirmItem: (itemId: string) => void;
}

/** Qué no se leyó bien de una línea (no muestra nada si no hay duda). */
export function IssueNote({ issue }: { issue?: ItemIssue }) {
  if (!issue) return null;
  return (
    <p className="rounded-xl border-2 border-warning bg-background p-3 text-base">
      <span className="font-bold text-warning">⚠ </span>
      {issue.message}
    </p>
  );
}

interface ItemActionButtonsProps extends ItemActionHandlers {
  itemId: string;
  issue?: ItemIssue;
  /** Sin el lápiz cuando el campo del monto ya está a la vista. */
  showQuickEdit?: boolean;
}

/** Botones compactos: ✏️ monto, ⚙️ edición avanzada y "Está bien" si hay una duda de lectura. */
export function ItemActionButtons({
  itemId,
  issue,
  showQuickEdit = true,
  onQuickEdit,
  onAdvancedEdit,
  onConfirmItem,
}: ItemActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {showQuickEdit && (
        <IconButton icon="✏️" label="Corregir monto" onClick={() => onQuickEdit(itemId)} />
      )}
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
  );
}

/** Qué pasó con la línea (si hay duda) y los botones para corregirla o confirmarla. */
export function ItemActions(props: ItemActionButtonsProps) {
  return (
    <div className="space-y-3">
      <IssueNote issue={props.issue} />
      <ItemActionButtons {...props} />
    </div>
  );
}
