"use client";

import { useMemo } from "react";
import type { BillSplitActions } from "@/hooks/use-bill-split";
import type { ReceiptSummary } from "@/lib/receipt/summarize-receipt";
import { getAllocation, type BillSplit } from "@/lib/split/bill-split";
import { allocatableUnits, computeSplit, productKey } from "@/lib/split/compute-split";
import { PartyBills } from "./party-bills";
import { PartySetup } from "./party-setup";
import { ProductAllocationCard } from "./product-allocation-card";

interface SplitViewProps {
  summary: ReceiptSummary;
  split: BillSplit;
  actions: BillSplitActions;
}

/** Dividir la cuenta: grupos, qué consumió cada uno y cuánto paga (propina incluida). */
export function SplitView({ summary, split, actions }: SplitViewProps) {
  const { groups, charges, currency, formatAmount } = summary;
  const result = useMemo(
    () => computeSplit(groups, split, charges, currency),
    [groups, split, charges, currency],
  );

  return (
    <div className="space-y-8">
      <PartySetup
        parties={split.parties}
        onCountChange={actions.setPartyCount}
        onRename={actions.renameParty}
      />
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
      <PartyBills result={result} formatAmount={formatAmount} />
    </div>
  );
}
