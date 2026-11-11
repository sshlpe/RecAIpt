"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HISTORY_PATH, HOME_PATH } from "@/lib/config/routes";
import { hasReceiptInProgress, useActiveReceipt } from "./active-receipt-provider";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { actionButtonClassName } from "./ui/action-button";
import { AppLogo } from "./ui/app-logo";
import { HistoryIcon } from "./ui/icons";

/**
 * Logo a la izquierda; "Historial" y "Nueva boleta" a la derecha. "Nueva boleta" no aparece en
 * la pantalla inicial vacía, que ya tiene el botón grande para fotografiar.
 */
export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { analysis } = useActiveReceipt();
  const isHome = pathname === HOME_PATH;
  const showNewReceipt = !isHome || hasReceiptInProgress(analysis);

  function handleNewReceipt(photos: File[]) {
    analysis.startNewReceipt(photos);
    if (!isHome) router.push(HOME_PATH);
  }

  return (
    // flex-wrap: en un teléfono muy angosto las acciones bajan a otra línea en vez de desbordar.
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <AppLogo compact={showNewReceipt} />
      <nav aria-label="Acciones" className="ml-auto flex gap-2">
        {pathname !== HISTORY_PATH && (
          <Link href={HISTORY_PATH} className={actionButtonClassName("secondary", "stacked")}>
            <HistoryIcon />
            <span>Historial</span>
          </Link>
        )}
        {showNewReceipt && (
          <CaptureReceiptButton
            label="Nueva boleta"
            size="stacked"
            onPhotosSelected={handleNewReceipt}
          />
        )}
      </nav>
    </header>
  );
}
