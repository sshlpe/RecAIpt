"use client";

import { useMemo, useState } from "react";
import {
  createBillSplit,
  renameParty,
  setPartyCount,
  setPartyUnits,
  setSplitMode,
  toggleShared,
  toggleSharedParty,
  type BillSplit,
  type SplitMode,
} from "@/lib/split/bill-split";

export interface BillSplitActions {
  setMode: (mode: SplitMode) => void;
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
  /** Empieza de cero (tras una lectura nueva, los productos pueden ser otros). */
  reset: () => void;
}

/** Estado de la división de la cuenta; la lógica vive en funciones puras de `bill-split`. */
export function useBillSplit(initialSplit: BillSplit) {
  const [split, setSplit] = useState(initialSplit);

  const actions = useMemo<BillSplitActions>(
    () => ({
      setMode: (mode) => setSplit((current) => setSplitMode(current, mode)),
      setPartyCount: (count) => setSplit((current) => setPartyCount(current, count)),
      renameParty: (partyId, name) => setSplit((current) => renameParty(current, partyId, name)),
      setPartyUnits: (productKey, partyId, units, allocatable) =>
        setSplit((current) => setPartyUnits(current, productKey, partyId, units, allocatable)),
      toggleShared: (productKey) => setSplit((current) => toggleShared(current, productKey)),
      toggleSharedParty: (productKey, partyId) =>
        setSplit((current) => toggleSharedParty(current, productKey, partyId)),
      reset: () => setSplit(createBillSplit()),
    }),
    [],
  );

  return { split, actions };
}
