import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

/** Marco común de las páginas: barra superior y contenido con ancho de teléfono. */
export function AppPage({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-8 pb-6">{children}</main>
    </>
  );
}
