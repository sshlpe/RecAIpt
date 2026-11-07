"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Panel que sube desde abajo, sobre <dialog> nativo (foco atrapado, cierra con Esc).
 * El contenido solo se monta mientras está abierto, así los formularios parten limpios.
 */
export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-background p-0 text-foreground backdrop:bg-black/60 sm:mx-auto sm:max-w-xl"
    >
      {open && (
        <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="min-h-11 min-w-11 cursor-pointer rounded-full bg-surface text-xl font-bold"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
