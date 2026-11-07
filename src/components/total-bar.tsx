import type { ReceiptSummary } from "@/lib/receipt/summarize-receipt";
import { TONE_ICON, TONE_SURFACE_CLASS, TONE_TEXT_CLASS, type Tone } from "./ui/tone-styles";

interface TotalBarProps {
  summary: ReceiptSummary;
  onOpenReview: () => void;
}

/** Con pendientes el botón llama la atención; sin ellos, solo da acceso al detalle. */
function reviewButtonContent(issueCount: number, tone: Tone): { label: string; tone: Tone } {
  if (issueCount > 0)
    return { label: `${TONE_ICON.warning} Revisar ${issueCount}`, tone: "warning" };
  return { label: `${TONE_ICON[tone]} Detalle`, tone };
}

/** Barra fija abajo: total calculado y acceso al detalle de lo que hay que revisar. */
export function TotalBar({ summary, onOpenReview }: TotalBarProps) {
  const { charges, payableTotal, issueCount, formatAmount, message } = summary;
  const button = reviewButtonContent(issueCount, message.tone);

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-surface bg-background px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="min-w-0" aria-live="polite">
          <p className="text-sm text-muted">Total{charges.tip > 0 ? " con propina" : ""}</p>
          <p className="text-2xl font-extrabold whitespace-nowrap tabular-nums">
            {formatAmount(payableTotal)}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenReview}
          className={`min-h-11 shrink-0 cursor-pointer rounded-xl border-2 px-3 text-base font-bold ${TONE_SURFACE_CLASS[button.tone]} ${TONE_TEXT_CLASS[button.tone]}`}
        >
          {button.label}
        </button>
      </div>
    </div>
  );
}
