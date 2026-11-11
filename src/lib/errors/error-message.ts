/** Mensaje para mostrar de un error desconocido (los nuestros ya vienen en español). */
export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
