import type { AmountFormatter } from "@/lib/receipt/describe-verification";
import type { PartyBill, SplitResult } from "@/lib/split/compute-split";
import { NoticeBox } from "../ui/notice-box";

interface PartyBillsProps {
  result: SplitResult;
  formatAmount: AmountFormatter;
}

function PartyBillCard({ bill, formatAmount }: { bill: PartyBill; formatAmount: AmountFormatter }) {
  return (
    <div className="space-y-2 rounded-2xl border-2 border-surface p-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="min-w-0 text-xl font-extrabold break-words">{bill.party.name}</p>
        <p className="shrink-0 text-2xl font-extrabold tabular-nums">{formatAmount(bill.total)}</p>
      </div>
      {bill.lines.length === 0 ? (
        <p className="text-base text-muted">Todavía no tiene productos asignados.</p>
      ) : (
        <ul className="space-y-1 text-base text-muted">
          {bill.lines.map((line) => (
            <li key={line.label} className="flex justify-between gap-4">
              <span className="min-w-0 break-words">{line.label}</span>
              <span className="shrink-0 tabular-nums">{formatAmount(line.amount)}</span>
            </li>
          ))}
          {bill.discount > 0 && (
            <li className="flex justify-between gap-4">
              <span>Su parte del descuento</span>
              <span className="tabular-nums">−{formatAmount(bill.discount)}</span>
            </li>
          )}
          {bill.taxes > 0 && (
            <li className="flex justify-between gap-4">
              <span>Su parte de los impuestos</span>
              <span className="tabular-nums">{formatAmount(bill.taxes)}</span>
            </li>
          )}
          {bill.tip > 0 && (
            <li className="flex justify-between gap-4">
              <span>Su parte de la propina</span>
              <span className="tabular-nums">{formatAmount(bill.tip)}</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/** Cuánto paga cada grupo, y lo que todavía falta asignar. */
export function PartyBills({ result, formatAmount }: PartyBillsProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-extrabold">Cuánto paga cada grupo</h2>
      {result.unassignedAmount > 0 && (
        <NoticeBox tone="warning" title={`Falta asignar ${formatAmount(result.unassignedAmount)}`}>
          <p>Hasta que no se asigne todo, la suma de los grupos no llega al total.</p>
        </NoticeBox>
      )}
      {result.bills.map((bill) => (
        <PartyBillCard key={bill.party.id} bill={bill} formatAmount={formatAmount} />
      ))}
    </section>
  );
}
