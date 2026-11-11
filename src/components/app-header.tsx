import { AppMenu } from "./app-menu";
import { AppLogo } from "./ui/app-logo";

/** Barra superior de la marca, de ancho completo: logo a la izquierda, "Menú" a la derecha. */
export function AppHeader() {
  return (
    <header className="bg-brand-bar text-brand-bar-foreground">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-4">
        <AppLogo />
        <AppMenu />
      </div>
    </header>
  );
}
