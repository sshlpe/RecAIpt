"use client";

import { useMemo } from "react";
import type { BillSplitActions } from "@/hooks/use-bill-split";
import type { ReceiptSummary } from "@/lib/receipt/summarize-receipt";
import {
  getAllocation,
  getSplitMode,
  type BillSplit,
  type SplitMode,
} from "@/lib/split/bill-split";
import { allocatableUnits, computeSplit, productKey } from "@/lib/split/compute-split";
import { SegmentedToggle } from "../ui/segmented-toggle";
import { PartyBills } from "./party-bills";
import { PartySetup } from "./party-setup";
import { ProductAllocationCard } from "./product-allocation-card";

const SPLIT_MODE_OPTIONS: { value: SplitMode; label: string }[] = [
  { value: "byProduct", label: "Por producto" },
  { value: "equal", label: "En partes iguales" },
];

interface SplitViewProps {
  summary: ReceiptSummary;
  split: BillSplit;
  actions: BillSplitActions;
}

/**
 * Dividir la cuenta: en partes iguales entre los grupos, o por producto (qué consumió cada uno).
 * En ambos casos, cuánto paga cada grupo con propina incluida.
 */
export function SplitView({ summary, split, actions }: SplitViewProps) {
  const { groups, charges, currency, formatAmount } = summary;
  const result = useMemo(
    () => computeSplit(groups, split, charges, currency),
    [groups, split, charges, currency],
  );

  const mode = getSplitMode(split);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">¿Cómo dividen la cuenta?</h2>
        <SegmentedToggle
          ariaLabel="Forma de dividir la cuenta"
          options={SPLIT_MODE_OPTIONS}
          selected={mode}
          onSelect={actions.setMode}
        />
      </section>
      <PartySetup
        parties={split.parties}
        onCountChange={actions.setPartyCount}
        onRename={actions.renameParty}
      />
      {mode === "byProduct" && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold">¿Qué consumió cada grupo?</h2>
          {groups.map((group) => {
            const key = productKey(group);
            return (
              <ProductAllocationCard
                key={key}
                group={group}
                allocation={getAllocation(split, key)}
                parties={split.parties}
                formatAmount={formatAmount}
                onSetUnits={(partyId, units) =>
                  actions.setPartyUnits(key, partyId, units, allocatableUnits(group))
                }
                onToggleShared={() => actions.toggleShared(key)}
                onToggleSharedParty={(partyId) => actions.toggleSharedParty(key, partyId)}
              />
            );
          })}
        </section>
      )}
      <PartyBills result={result} formatAmount={formatAmount} />
    </div>
  );
}
