import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

/** Marco común de las páginas: ancho de teléfono y encabezado con las acciones. */
export function AppPage({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <AppHeader />
      {children}
    </main>
  );
}
