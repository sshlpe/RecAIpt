"use client";

import { useEffect } from "react";
import { saveReceipt } from "@/lib/history/receipt-history-store";
import type { SavedReceipt } from "@/lib/history/saved-receipt";

/**
 * Guarda la boleta en el dispositivo apenas se lee y en cada cambio. Sin debounce: los cambios
 * son acciones puntuales, la escritura es chica y así nada se pierde si se cierra la app.
 * IndexedDB ejecuta las escrituras de un mismo almacén en orden, así que gana la última.
 */
export function useReceiptAutosave(saved: SavedReceipt): void {
  useEffect(() => {
    saveReceipt(saved).catch((error: unknown) =>
      console.error("No se pudo guardar la boleta en el historial", error),
    );
  }, [saved]);
}
