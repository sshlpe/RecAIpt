import Link from "next/link";
import type { HistoryEntry } from "@/lib/history/describe-saved-receipt";

/** Boletas anteriores: local, fecha y total; cada una abre su página. */
export function ReceiptHistoryList({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="space-y-3" aria-labelledby="history-title">
      <h2 id="history-title" className="text-xl font-extrabold">
        Boletas anteriores
      </h2>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/boletas/${entry.id}`}
              className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border-2 border-border px-4 py-3 focus-visible:outline-4 focus-visible:outline-accent"
            >
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold">{entry.title}</span>
                <span className="block text-base text-muted">{entry.dateLabel}</span>
              </span>
              <span className="shrink-0 text-lg font-extrabold tabular-nums">
                {entry.totalLabel}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
