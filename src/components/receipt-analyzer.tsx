"use client";

import { useReceiptAnalysis } from "@/hooks/use-receipt-analysis";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { ReceiptResult } from "./receipt-result";
import { NoticeBox } from "./ui/notice-box";

/** Pantalla principal: capturar -> procesar -> ver resultado o error. */
export function ReceiptAnalyzer() {
  const { state, analyzePhoto } = useReceiptAnalysis();

  if (state.status === "idle") {
    return (
      <div className="space-y-6">
        <p className="text-lg">Saca una foto a la boleta completa, con buena luz.</p>
        <CaptureReceiptButton label="Fotografiar boleta" onPhotoSelected={analyzePhoto} />
      </div>
    );
  }

  return (
    // pb-28: espacio para que la barra fija del total no tape el final de la página.
    <div className={`space-y-6 ${state.status === "done" ? "pb-28" : ""}`}>
      {state.status === "processing" && (
        <NoticeBox tone="info" title="Leyendo la boleta…">
          <p>Suele tomar entre 10 y 20 segundos. No cierres la pantalla.</p>
        </NoticeBox>
      )}
      {state.status === "error" && (
        <NoticeBox tone="warning" title="No pudimos leer la boleta">
          <p>{state.message}</p>
        </NoticeBox>
      )}
      {state.status === "done" && (
        // key: cada foto nueva parte con sus correcciones en blanco.
        <ReceiptResult
          key={state.photoUrl}
          receipt={state.receipt}
          photoUrl={state.photoUrl}
          onNewPhoto={analyzePhoto}
        />
      )}
      {state.status === "error" && (
        <CaptureReceiptButton label="Fotografiar otra boleta" onPhotoSelected={analyzePhoto} />
      )}
    </div>
  );
}
