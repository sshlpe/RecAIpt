"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSavedReceipt } from "@/hooks/use-receipt-history";
import { HISTORY_PATH } from "@/lib/config/routes";
import { useReceiptSession } from "@/hooks/use-receipt-session";
import { deleteReceipt } from "@/lib/history/receipt-history-store";
import type { SavedReceipt } from "@/lib/history/saved-receipt";
import { ReceiptResult } from "../receipt-result";
import { ActionButton, actionButtonClassName } from "../ui/action-button";
import { ConfirmAction } from "../ui/confirm-action";
import { NoticeBox } from "../ui/notice-box";
import { FinalReceiptSummary } from "./final-receipt-summary";

/** `replace`: volver al historial no deja la boleta inexistente en el "atrás". */
function BackToHistoryLink() {
  return (
    <Link href={HISTORY_PATH} replace className={actionButtonClassName("secondary", "compact")}>
      ← Historial
    </Link>
  );
}

function DeleteReceiptAction({ onDelete }: { onDelete: () => void }) {
  return (
    <ConfirmAction
      label="Borrar esta boleta"
      variant="danger-outline"
      warning="¿Borrar esta boleta del historial? No se puede deshacer."
      renderConfirm={() => (
        <ActionButton variant="danger" onClick={onDelete}>
          Sí, borrar
        </ActionButton>
      )}
    />
  );
}

/** Resumen final por defecto; la boleta completa (editable) se abre a pedido. */
function SavedReceiptView({ saved }: { saved: SavedReceipt }) {
  const router = useRouter();
  const session = useReceiptSession(saved);
  const [isFullReceiptOpen, setIsFullReceiptOpen] = useState(false);

  async function handleDelete() {
    await deleteReceipt(saved.id);
    router.replace(HISTORY_PATH);
  }
  const deleteAction = <DeleteReceiptAction onDelete={handleDelete} />;

  if (!isFullReceiptOpen) {
    return (
      <FinalReceiptSummary session={session} onOpenFullReceipt={() => setIsFullReceiptOpen(true)}>
        {deleteAction}
      </FinalReceiptSummary>
    );
  }
  return (
    // pb-28: espacio para que la barra fija del total no tape el final de la página.
    <div className="space-y-6 pb-28">
      <ActionButton variant="secondary" onClick={() => setIsFullReceiptOpen(false)}>
        Ver el resumen final
      </ActionButton>
      <ReceiptResult session={session} photoUrls={[]} photos={[]} extraOptions={deleteAction} />
    </div>
  );
}

/** Una boleta del historial, cargada desde el dispositivo. */
export function SavedReceiptScreen({ id }: { id: string }) {
  const state = useSavedReceipt(id);

  if (state.status === "loading") return null;
  if (!state.value) {
    return (
      <div className="space-y-6">
        <NoticeBox tone="warning" title="No encontramos esta boleta">
          <p>Puede que se haya borrado de este teléfono.</p>
        </NoticeBox>
        <BackToHistoryLink />
      </div>
    );
  }
  return <SavedReceiptView key={state.value.id} saved={state.value} />;
}
