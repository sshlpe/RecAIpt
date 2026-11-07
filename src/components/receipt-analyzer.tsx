"use client";

import { useReceiptAnalysis } from "@/hooks/use-receipt-analysis";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { HomeIntro } from "./home-intro";
import { ReadingReceipt } from "./reading-receipt";
import { ReceiptResult } from "./receipt-result";
import { NoticeBox } from "./ui/notice-box";

/** Pantalla principal: capturar -> procesar -> ver resultado o error. */
export function ReceiptAnalyzer() {
  const { state, analyzePhoto } = useReceiptAnalysis();

  if (state.status === "idle") return <HomeIntro onPhotoSelected={analyzePhoto} />;
  if (state.status === "processing") return <ReadingReceipt photoUrl={state.photoUrl} />;

  return (
    // pb-28: espacio para que la barra fija del total no tape el final de la página.
    <div className={`space-y-6 ${state.status === "done" ? "pb-28" : ""}`}>
      {state.status === "error" && (
        <NoticeBox tone="warning" title="No pudimos leer la boleta">
          <p>{state.message}</p>
        </NoticeBox>
      )}
      {state.status === "done" && <h1 className="sr-only">Tu boleta</h1>}
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
