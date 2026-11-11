import { createStore, del, get, set, values, type UseStore } from "idb-keyval";
import { isCurrentSchema, type SavedReceipt } from "./saved-receipt";

/**
 * Historial de boletas en IndexedDB, en el mismo dispositivo (sin cuentas ni servidor).
 * Un registro por boleta: cada cambio reescribe solo esa boleta, no todo el historial.
 * Es el único archivo que toca el almacenamiento.
 */

const DATABASE_NAME = "recaipt";
const STORE_NAME = "receipts";

let store: UseStore | null = null;
let persistenceRequested = false;

/** Perezoso: IndexedDB no existe durante el render en el servidor. */
function getStore(): UseStore {
  store ??= createStore(DATABASE_NAME, STORE_NAME);
  return store;
}

/** Pide que el navegador no borre los datos cuando le falte espacio (una vez por sesión). */
function requestPersistentStorage(): void {
  if (persistenceRequested) return;
  persistenceRequested = true;
  void navigator.storage?.persist?.().catch(() => false);
}

export async function saveReceipt(saved: SavedReceipt): Promise<void> {
  requestPersistentStorage();
  await set(saved.id, saved, getStore());
}

export async function getReceipt(id: string): Promise<SavedReceipt | null> {
  const value: unknown = await get(id, getStore());
  return isCurrentSchema(value) ? value : null;
}

/** Todas las boletas, la última leída primero. */
export async function listReceipts(): Promise<SavedReceipt[]> {
  const all: unknown[] = await values(getStore());
  return all.filter(isCurrentSchema).sort((a, b) => b.readAt.localeCompare(a.readAt));
}

export async function deleteReceipt(id: string): Promise<void> {
  await del(id, getStore());
}
