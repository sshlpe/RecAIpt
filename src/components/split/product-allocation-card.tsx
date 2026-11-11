import { formatQuantity, formatQuantityLabel } from "@/lib/format/format-numbers";
import type { AmountFormatter } from "@/lib/receipt/describe-verification";
import type { ItemGroup } from "@/lib/receipt/group-items";
import type { ProductAllocation, SplitParty } from "@/lib/split/bill-split";
import { remainingUnits } from "@/lib/split/compute-split";
import { CheckboxRow } from "../ui/checkbox-row";
import { Stepper } from "../ui/stepper";

interface ProductAllocationCardProps {
  group: ItemGroup;
  allocation: ProductAllocation;
  parties: SplitParty[];
  formatAmount: AmountFormatter;
  onSetUnits: (partyId: string, units: number) => void;
  onToggleShared: () => void;
  onToggleSharedParty: (partyId: string) => void;
}

function describeStatus(remaining: number, sharedBy: string[] | null): string {
  if (sharedBy?.length === 0) return "⚠ Marca quiénes lo compartieron";
  if (remaining > 0) return `⚠ Falta asignar ${formatQuantity(remaining)}`;
  return sharedBy ? `✓ Compartido entre ${sharedBy.length}` : "✓ Asignado";
}

/** Un producto: unidades para cada grupo, o compartido en partes iguales entre los marcados. */
export function ProductAllocationCard({
  group,
  allocation,
  parties,
  formatAmount,
  onSetUnits,
  onToggleShared,
  onToggleSharedParty,
}: ProductAllocationCardProps) {
  const { sharedBy } = allocation;
  const remaining = remainingUnits(group, allocation);
  const isPending = remaining > 0;

  return (
    <div
      className={`space-y-3 rounded-2xl border-2 p-3 ${isPending ? "border-warning" : "border-surface"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-lg font-semibold">
          {formatQuantityLabel(group.totalQuantity, group.name)}
        </p>
        <p className="shrink-0 text-lg font-bold tabular-nums">{formatAmount(group.totalAmount)}</p>
      </div>
      <p className={`text-base font-bold ${isPending ? "text-warning" : "text-success"}`}>
        {describeStatus(remaining, sharedBy)}
      </p>
      <CheckboxRow checked={sharedBy !== null} onChange={onToggleShared}>
        Compartido, en partes iguales
      </CheckboxRow>
      {sharedBy
        ? parties.map((party) => (
            <div key={party.id} className="pl-9">
              <CheckboxRow
                checked={sharedBy.includes(party.id)}
                onChange={() => onToggleSharedParty(party.id)}
              >
                {party.name}
              </CheckboxRow>
            </div>
          ))
        : parties.map((party) => {
            const units = allocation.unitsByParty[party.id] ?? 0;
            return (
              <div key={party.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 text-base break-words">{party.name}</span>
                <Stepper
                  label={`${group.name} para ${party.name}`}
                  value={units}
                  max={units + remaining}
                  onChange={(next) => onSetUnits(party.id, next)}
                />
              </div>
            );
          })}
      {!Number.isInteger(group.totalQuantity) && !sharedBy && (
        <p className="text-base text-muted">Es por peso: se asigna completo a un grupo.</p>
      )}
    </div>
  );
}
