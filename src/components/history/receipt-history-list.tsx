import Link from "next/link";
import { HOME_PATH, savedReceiptPath } from "@/lib/config/routes";
import type { HistoryEntry } from "@/lib/history/describe-saved-receipt";

interface ReceiptHistoryListProps {
  entries: HistoryEntry[];
  /** La boleta que se está revisando en el inicio: abre esa pantalla, no una copia aparte. */
  activeReceiptId: string | null;
}

/** Boletas guardadas: local, fecha y total; cada una abre su página. */
export function ReceiptHistoryList({ entries, activeReceiptId }: ReceiptHistoryListProps) {
  // Vacía igual se muestra: así se sabe que las boletas leídas quedan guardadas.
  if (entries.length === 0) {
    return (
      <p className="text-lg text-muted">
        Aquí aparecerán las boletas que leas. Se guardan solas en este teléfono.
      </p>
    );
  }
  return (
    <ul className="space-y-2" aria-label="Boletas guardadas">
      {entries.map((entry) => {
        const isActive = entry.id === activeReceiptId;
        return (
          <li key={entry.id}>
            <Link
              href={isActive ? HOME_PATH : savedReceiptPath(entry.id)}
              className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border-2 border-border px-4 py-3 focus-visible:outline-4 focus-visible:outline-accent"
            >
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold">{entry.title}</span>
                <span className="block text-base text-muted">
                  {entry.dateLabel}
                  {isActive && " · En revisión"}
                </span>
              </span>
              <span className="shrink-0 text-lg font-extrabold tabular-nums">
                {entry.totalLabel}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
