import Link from "next/link";
import { APP_NAME } from "@/lib/config/app-info";
import { HOME_PATH } from "@/lib/config/routes";

/** Ruta del logo: Next sirve src/app/icon.svg en /icon.svg (la misma fuente que el favicon). */
const LOGO_SRC = "/icon.svg";
const LOGO_SIZE_PX = 36;

/** Logo y nombre de la app; lleva al inicio (donde sigue la boleta en curso, si hay). */
export function AppLogo() {
  return (
    <Link href={HOME_PATH} className="flex shrink-0 items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático, no requiere optimización */}
      <img src={LOGO_SRC} alt="" width={LOGO_SIZE_PX} height={LOGO_SIZE_PX} />
      <span className="text-2xl font-extrabold tracking-tight">{APP_NAME}</span>
    </Link>
  );
}
