"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useReceiptAnalysis } from "@/hooks/use-receipt-analysis";
import { useReceiptSession, type ReceiptSession } from "@/hooks/use-receipt-session";
import type { SavedReceipt } from "@/lib/history/saved-receipt";

type ReceiptAnalysis = ReturnType<typeof useReceiptAnalysis>;

interface ActiveReceipt {
  analysis: ReceiptAnalysis;
  /** La boleta recién leída que se está revisando; null mientras no hay una. */
  session: ReceiptSession | null;
}

const ActiveReceiptContext = createContext<ActiveReceipt | null>(null);

interface SessionHostProps {
  analysis: ReceiptAnalysis;
  saved: SavedReceipt;
  children: ReactNode;
}

/** Monta la sesión de la boleta leída; con `key` por boleta, cada lectura parte en limpio. */
function SessionHost({ analysis, saved, children }: SessionHostProps) {
  const session = useReceiptSession(saved);
  return (
    <ActiveReceiptContext.Provider value={{ analysis, session }}>
      {children}
    </ActiveReceiptContext.Provider>
  );
}

/**
 * La boleta en curso (fotos, lectura y correcciones) vive aquí, sobre las páginas: ir al
 * historial y volver no la descarta, aunque la lectura siga en camino.
 */
export function ActiveReceiptProvider({ children }: { children: ReactNode }) {
  const analysis = useReceiptAnalysis();
  const saved = analysis.state.status === "done" ? analysis.state.saved : null;

  if (!saved) {
    return (
      <ActiveReceiptContext.Provider value={{ analysis, session: null }}>
        {children}
      </ActiveReceiptContext.Provider>
    );
  }
  return (
    <SessionHost key={saved.id} analysis={analysis} saved={saved}>
      {children}
    </SessionHost>
  );
}

/** Hay algo en curso (fotos, lectura o boleta leída): no es la pantalla inicial vacía. */
export function hasReceiptInProgress(analysis: ReceiptAnalysis): boolean {
  return analysis.state.status !== "capturing" || analysis.photoUrls.length > 0;
}

export function useActiveReceipt(): ActiveReceipt {
  const value = useContext(ActiveReceiptContext);
  if (!value) throw new Error("useActiveReceipt requiere ActiveReceiptProvider");
  return value;
}
