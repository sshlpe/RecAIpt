"use client";

import { useMemo, useState } from "react";
import {
  createBillSplit,
  renameParty,
  setPartyCount,
  setPartyUnits,
  toggleShared,
  toggleSharedParty,
} from "@/lib/split/bill-split";

export interface BillSplitActions {
  setPartyCount: (count: number) => void;
  renameParty: (partyId: string, name: string) => void;
  setPartyUnits: (
    productKey: string,
    partyId: string,
    units: number,
    allocatableUnits: number,
  ) => void;
  toggleShared: (productKey: string) => void;
  toggleSharedParty: (productKey: string, partyId: string) => void;
}

/** Estado de la división de la cuenta; la lógica vive en funciones puras de `bill-split`. */
export function useBillSplit() {
  const [split, setSplit] = useState(() => createBillSplit());

  const actions = useMemo<BillSplitActions>(
    () => ({
      setPartyCount: (count) => setSplit((current) => setPartyCount(current, count)),
      renameParty: (partyId, name) => setSplit((current) => renameParty(current, partyId, name)),
      setPartyUnits: (productKey, partyId, units, allocatable) =>
        setSplit((current) => setPartyUnits(current, productKey, partyId, units, allocatable)),
      toggleShared: (productKey) => setSplit((current) => toggleShared(current, productKey)),
      toggleSharedParty: (productKey, partyId) =>
        setSplit((current) => toggleSharedParty(current, productKey, partyId)),
    }),
    [],
  );

  return { split, actions };
}
