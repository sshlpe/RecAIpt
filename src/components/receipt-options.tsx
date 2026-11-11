"use client";

import type { ReactNode } from "react";
import type { RereadState } from "@/hooks/use-receipt-session";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { ActionButton } from "./ui/action-button";
import { ConfirmAction } from "./ui/confirm-action";
import { NoticeBox } from "./ui/notice-box";

interface ReceiptOptionsProps {
  /** Fotos en memoria (lectura recién hecha). Sin ellas, "leer de nuevo" pide subirlas. */
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
    return <NoticeBox tone="info" title="Leyendo de nuevo la boleta…" />;
  }
  if (state.status === "error") {
    return (
      <NoticeBox tone="warning" title="No se pudo leer de nuevo">
        <p>{state.message}</p>
      </NoticeBox>
    );
  }
  return null;
}

/**
 * Acciones sobre ESTA boleta (no crean otra): leerla de nuevo con la IA o volver a lo que leyó.
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
          label="Leer de nuevo con la IA"
          warning={
            photos.length > 0
              ? "Se vuelve a leer la foto. Se pierden las correcciones y la división de esta boleta."
              : "Sube de nuevo la foto de esta boleta. Se pierden sus correcciones y su división."
          }
          renderConfirm={(close) =>
            photos.length > 0 ? (
              <ActionButton onClick={() => (onReread(photos), close())}>
                Sí, leer de nuevo
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
          label="Volver a lo que leyó la IA"
          warning="Se pierden las correcciones de productos y montos. El nombre, la fecha, la propina y la división se mantienen."
          renderConfirm={(close) => (
            <ActionButton onClick={() => (onResetToOriginal(), close())}>Sí, volver</ActionButton>
          )}
        />
      )}
      {children}
    </section>
  );
}
