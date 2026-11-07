import { APP_NAME } from "@/lib/config/app-info";

/** Ruta del logo: Next sirve src/app/icon.svg en /icon.svg (la misma fuente que el favicon). */
const LOGO_SRC = "/icon.svg";
const LOGO_SIZE_PX = 52;

/** Logo y nombre de la app, para el encabezado. */
export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático, no requiere optimización */}
      <img src={LOGO_SRC} alt="" width={LOGO_SIZE_PX} height={LOGO_SIZE_PX} />
      <span className="text-3xl font-extrabold tracking-tight">{APP_NAME}</span>
    </div>
  );
}
