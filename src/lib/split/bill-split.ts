/**
 * División de la cuenta entre grupos de personas. Funciones puras: devuelven una copia.
 * Las asignaciones se guardan por producto (clave de agrupación) y por unidades.
 */

export interface SplitParty {
  id: string;
  name: string;
}

export interface ProductAllocation {
  /**
   * Grupos que comparten el producto por partes iguales (ignora las unidades).
   * null = no es compartido; [] = compartido pero sin nadie marcado (queda sin asignar).
   */
  sharedBy: string[] | null;
  unitsByParty: Record<string, number>;
}

export interface BillSplit {
  parties: SplitParty[];
  /** Por clave de producto (toGroupingKey del nombre). */
  allocations: Record<string, ProductAllocation>;
}

export const MIN_PARTIES = 2;
export const MAX_PARTIES = 8;

const EMPTY_ALLOCATION: ProductAllocation = { sharedBy: null, unitsByParty: {} };

function createParty(index: number): SplitParty {
  return { id: `party-${index}`, name: `Grupo ${index + 1}` };
}

function clampPartyCount(count: number): number {
  return Math.min(MAX_PARTIES, Math.max(MIN_PARTIES, count));
}

export function createBillSplit(partyCount: number = MIN_PARTIES): BillSplit {
  const parties = Array.from({ length: clampPartyCount(partyCount) }, (_, index) =>
    createParty(index),
  );
  return { parties, allocations: {} };
}

export function getAllocation(split: BillSplit, productKey: string): ProductAllocation {
  return split.allocations[productKey] ?? EMPTY_ALLOCATION;
}

function withAllocation(
  split: BillSplit,
  productKey: string,
  allocation: ProductAllocation,
): BillSplit {
  return { ...split, allocations: { ...split.allocations, [productKey]: allocation } };
}

/** Cambia la cantidad de grupos; al quitar grupos se borran sus asignaciones. */
export function setPartyCount(split: BillSplit, count: number): BillSplit {
  const target = clampPartyCount(count);
  const parties = Array.from(
    { length: target },
    (_, index) => split.parties[index] ?? createParty(index),
  );
  const keptIds = new Set(parties.map((party) => party.id));
  const allocations = Object.fromEntries(
    Object.entries(split.allocations).map(([key, allocation]) => [
      key,
      {
        sharedBy: allocation.sharedBy?.filter((partyId) => keptIds.has(partyId)) ?? null,
        unitsByParty: Object.fromEntries(
          Object.entries(allocation.unitsByParty).filter(([partyId]) => keptIds.has(partyId)),
        ),
      },
    ]),
  );
  return { parties, allocations };
}

export function renameParty(split: BillSplit, partyId: string, name: string): BillSplit {
  return {
    ...split,
    parties: split.parties.map((party) => (party.id === partyId ? { ...party, name } : party)),
  };
}

/** Unidades asignadas a todos los grupos menos `exceptPartyId`. */
function unitsOfOthers(allocation: ProductAllocation, exceptPartyId: string): number {
  return Object.entries(allocation.unitsByParty)
    .filter(([partyId]) => partyId !== exceptPartyId)
    .reduce((total, [, units]) => total + units, 0);
}

/** Asigna unidades a un grupo, sin pasarse de las unidades del producto. */
export function setPartyUnits(
  split: BillSplit,
  productKey: string,
  partyId: string,
  units: number,
  allocatableUnits: number,
): BillSplit {
  const allocation = getAllocation(split, productKey);
  const available = allocatableUnits - unitsOfOthers(allocation, partyId);
  const clamped = Math.max(0, Math.min(units, available));
  return withAllocation(split, productKey, {
    ...allocation,
    unitsByParty: { ...allocation.unitsByParty, [partyId]: clamped },
  });
}

/** Activa "Compartido" con todos los grupos marcados (el caso común), o lo desactiva. */
export function toggleShared(split: BillSplit, productKey: string): BillSplit {
  const allocation = getAllocation(split, productKey);
  const sharedBy = allocation.sharedBy ? null : split.parties.map((party) => party.id);
  return withAllocation(split, productKey, { ...allocation, sharedBy });
}

/** Marca o desmarca un grupo entre los que comparten el producto. */
export function toggleSharedParty(
  split: BillSplit,
  productKey: string,
  partyId: string,
): BillSplit {
  const allocation = getAllocation(split, productKey);
  const current = allocation.sharedBy ?? [];
  const sharedBy = current.includes(partyId)
    ? current.filter((id) => id !== partyId)
    : [...current, partyId];
  return withAllocation(split, productKey, { ...allocation, sharedBy });
}

/** Si se llegó a asignar algo: una división sin asignaciones no se muestra en el resumen. */
export function isSplitInUse(split: BillSplit): boolean {
  return Object.values(split.allocations).some(
    (allocation) =>
      (allocation.sharedBy?.length ?? 0) > 0 ||
      Object.values(allocation.unitsByParty).some((units) => units > 0),
  );
}
