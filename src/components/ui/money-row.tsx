import { formatCurrency } from "@/lib/format/currency";

interface MoneyRowProps {
  label: string;
  amount: number;
  currency: string;
  detail?: string | null;
  /** Marca de atención visible en la fila (ej: "Revisar"). */
  flag?: string | null;
  /** Etiqueta informativa (ej: "Corregido"). */
  badge?: string | null;
  /** Si existe, la fila es un botón (abre el detalle). */
  onSelect?: () => void;
}

/** Fila de lista: descripción a la izquierda, monto a la derecha; tocable si tiene `onSelect`. */
export function MoneyRow({
  label,
  amount,
  currency,
  detail,
  flag,
  badge,
  onSelect,
}: MoneyRowProps) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold break-words">{label}</p>
        {detail && <p className="mt-1 text-base text-muted break-words">{detail}</p>}
        {(flag || badge) && (
          <div className="mt-1 flex flex-wrap gap-2">
            {flag && <span className="text-base font-bold text-warning">⚠ {flag}</span>}
            {badge && <span className="text-base font-bold text-success">✓ {badge}</span>}
          </div>
        )}
      </div>
      <p className="shrink-0 text-lg font-bold tabular-nums">{formatCurrency(amount, currency)}</p>
      {onSelect && (
        <span aria-hidden className="shrink-0 self-center text-2xl text-muted">
          ›
        </span>
      )}
    </>
  );
  const rowClass = "flex w-full items-start gap-3 px-3 py-3 text-left";

  return (
    <li
      className={`border-b-2 border-surface ${
        flag ? "my-1 rounded-xl border-l-8 border-l-warning bg-warning-surface" : ""
      }`}
    >
      {onSelect ? (
        <button type="button" onClick={onSelect} className={`${rowClass} cursor-pointer`}>
          {content}
        </button>
      ) : (
        <div className={rowClass}>{content}</div>
      )}
    </li>
  );
}
