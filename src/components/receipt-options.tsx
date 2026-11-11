"use client";

import type { ReactNode } from "react";
import type { RereadState } from "@/hooks/use-receipt-session";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { ActionButton } from "./ui/action-button";
import { ConfirmAction } from "./ui/confirm-action";
import { NoticeBox } from "./ui/notice-box";

interface ReceiptOptionsProps {
  /** Fotos en memoria (lectura recién hecha). Sin ellas, "Reprocesar" pide subirlas. */
  photos: File[];
  hasCorrections: boolean;
  rereadState: RereadState;
  onReread: (photos: File[]) => void;
  onResetToOriginal: () => void;
  /** Opciones extra de la pantalla (ej: borrar, en el historial). */
  children?: ReactNode;
}

function RereadStatus({ state }: { state: RereadState }) {
  if (state.status === "reading") {
    return <NoticeBox tone="info" title="Reprocesando la boleta…" />;
  }
  if (state.status === "error") {
    return (
      <NoticeBox tone="warning" title="No se pudo reprocesar">
        <p>{state.message}</p>
      </NoticeBox>
    );
  }
  return null;
}

/**
 * Acciones sobre ESTA boleta (no crean otra): "Reprocesar" (otra lectura de la IA) y
 * "Restablecer" (volver a lo que leyó). Términos comunes en apps; el aviso explica el efecto.
 * Las dos descartan correcciones, así que piden confirmación.
 */
export function ReceiptOptions(props: ReceiptOptionsProps) {
  const { photos, hasCorrections, rereadState, onReread, onResetToOriginal, children } = props;
  const isReading = rereadState.status === "reading";

  return (
    <section className="space-y-3" aria-labelledby="receipt-options-title">
      <h2 id="receipt-options-title" className="text-lg font-extrabold">
        Opciones de esta boleta
      </h2>
      <RereadStatus state={rereadState} />
      {!isReading && (
        <ConfirmAction
          label="Reprocesar"
          warning={
            photos.length > 0
              ? "La IA vuelve a leer la foto. Se pierden las correcciones y la división de esta boleta."
              : "Sube de nuevo la foto y la IA la vuelve a leer. Se pierden las correcciones y la división de esta boleta."
          }
          renderConfirm={(close) =>
            photos.length > 0 ? (
              <ActionButton onClick={() => (onReread(photos), close())}>
                Sí, reprocesar
              </ActionButton>
            ) : (
              <CaptureReceiptButton
                label="Subir la foto de nuevo"
                onPhotosSelected={(files) => (onReread(files), close())}
              />
            )
          }
        />
      )}
      {hasCorrections && !isReading && (
        <ConfirmAction
          label="Restablecer"
          warning="Vuelve a lo que leyó la IA: se pierden las correcciones de productos y montos. El nombre, la fecha, la propina y la división se mantienen."
          renderConfirm={(close) => (
            <ActionButton onClick={() => (onResetToOriginal(), close())}>
              Sí, restablecer
            </ActionButton>
          )}
        />
      )}
      {children}
    </section>
  );
}
