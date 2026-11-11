"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { HISTORY_PATH, HOME_PATH } from "@/lib/config/routes";
import { hasReceiptInProgress, useActiveReceipt } from "./active-receipt-provider";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { actionButtonClassName } from "./ui/action-button";
import { BottomSheet } from "./ui/bottom-sheet";
import { IconButton } from "./ui/icon-button";
import { HistoryIcon, MenuIcon } from "./ui/icons";

/**
 * "Menú" de la barra superior: abre un panel con botones grandes (no un desplegable chico).
 * "Nueva boleta" no aparece en la pantalla inicial vacía, que ya tiene el botón para fotografiar.
 */
export function AppMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { analysis } = useActiveReceipt();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const isHome = pathname === HOME_PATH;
  const inProgress = hasReceiptInProgress(analysis);

  function handleNewReceipt(photos: File[]) {
    close();
    analysis.startNewReceipt(photos);
    if (!isHome) router.push(HOME_PATH);
  }

  return (
    <>
      <IconButton
        icon={<MenuIcon />}
        label="Menú"
        variant="on-brand"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      />
      <BottomSheet open={isOpen} title="Menú" onClose={close}>
        <nav aria-label="Menú" className="space-y-3">
          {(!isHome || inProgress) && (
            <CaptureReceiptButton label="Nueva boleta" onPhotosSelected={handleNewReceipt} />
          )}
          {!isHome && inProgress && (
            <Link href={HOME_PATH} onClick={close} className={actionButtonClassName("secondary")}>
              Seguir con la boleta en curso
            </Link>
          )}
          {pathname !== HISTORY_PATH && (
            <Link
              href={HISTORY_PATH}
              onClick={close}
              className={actionButtonClassName("secondary")}
            >
              <HistoryIcon />
              Historial de boletas
            </Link>
          )}
        </nav>
      </BottomSheet>
    </>
  );
}
