/** Rutas de la app, en un solo lugar. */
export const HOME_PATH = "/";
export const HISTORY_PATH = "/boletas";

export function savedReceiptPath(id: string): string {
  return `${HISTORY_PATH}/${id}`;
}
