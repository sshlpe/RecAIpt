import Link from "next/link";
import { APP_NAME } from "@/lib/config/app-info";
import { HOME_PATH } from "@/lib/config/routes";

/** Ruta del logo: Next sirve src/app/icon.svg en /icon.svg (la misma fuente que el favicon). */
const LOGO_SRC = "/icon.svg";
const LOGO_SIZE_PX = 44;
/** Lo que se destaca dentro del nombre: "RECAIPT" = "receipt" con la "AI" a la vista. */
const HIGHLIGHT = "AI";

/**
 * El nombre en mayúsculas con "AI" en otro color. Visualmente son tres trozos; para el lector
 * de pantalla se dice el nombre completo una sola vez.
 */
function AppName() {
  const [before, after] = APP_NAME.split(HIGHLIGHT);
  return (
    <span className="text-3xl font-extrabold tracking-wide uppercase">
      <span className="sr-only">{APP_NAME}</span>
      <span aria-hidden>
        {before}
        <span className="text-brand-bar-accent">{HIGHLIGHT}</span>
        {after}
      </span>
    </span>
  );
}

/** Logo y nombre de la app; lleva al inicio (donde sigue la boleta en curso, si hay). */
export function AppLogo() {
  return (
    <Link href={HOME_PATH} className="flex shrink-0 items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático, no requiere optimización */}
      <img src={LOGO_SRC} alt="" width={LOGO_SIZE_PX} height={LOGO_SIZE_PX} />
      <AppName />
    </Link>
  );
}
