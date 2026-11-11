import type { ReactNode } from "react";
import { AppLogo } from "./ui/app-logo";

/** Marco común de las páginas: ancho de teléfono y logo arriba. */
export function AppPage({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      {/* Marca; el título principal (h1) lo pone cada pantalla. */}
      <header className="mb-5">
        <AppLogo />
      </header>
      {children}
    </main>
  );
}
