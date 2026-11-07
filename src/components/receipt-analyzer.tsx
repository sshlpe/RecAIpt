"use client";

import { useReceiptAnalysis } from "@/hooks/use-receipt-analysis";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { HomeIntro } from "./home-intro";
import { ReadingReceipt } from "./reading-receipt";
import { ReceiptPhotoCollection } from "./receipt-photo-collection";
import { ReceiptResult } from "./receipt-result";
import { ActionButton } from "./ui/action-button";
import { NoticeBox } from "./ui/notice-box";

/** Pantalla principal: fotografiar -> juntar fotos -> procesar -> ver resultado o error. */
export function ReceiptAnalyzer() {
  const {
    state,
    photoUrls,
    canAddPhotos,
    startNewReceipt,
    addPhotos,
    removePhoto,
    analyzePhotos,
  } = useReceiptAnalysis();

  if (state.status === "capturing" && photoUrls.length === 0) {
    return <HomeIntro onPhotosSelected={startNewReceipt} />;
  }
  if (state.status === "capturing") {
    return (
      <ReceiptPhotoCollection
        photoUrls={photoUrls}
        canAddPhotos={canAddPhotos}
        onAddPhotos={addPhotos}
        onRemovePhoto={removePhoto}
        onRead={analyzePhotos}
      />
    );
  }
  // La primera foto basta como referencia visual mientras se lee.
  if (state.status === "processing") return <ReadingReceipt photoUrl={photoUrls[0]} />;

  if (state.status === "error") {
    return (
      <div className="space-y-6">
        <NoticeBox tone="warning" title="No pudimos leer la boleta">
          <p>{state.message}</p>
        </NoticeBox>
        <ActionButton onClick={analyzePhotos}>Intentar de nuevo</ActionButton>
        <CaptureReceiptButton
          label="Fotografiar otra boleta"
          variant="secondary"
          onPhotosSelected={startNewReceipt}
        />
      </div>
    );
  }

  return (
    // pb-28: espacio para que la barra fija del total no tape el final de la página.
    <div className="space-y-6 pb-28">
      <h1 className="sr-only">Tu boleta</h1>
      {/* key: cada boleta nueva parte con sus correcciones en blanco. */}
      <ReceiptResult
        key={photoUrls[0]}
        receipt={state.receipt}
        photoUrls={photoUrls}
        onNewReceipt={startNewReceipt}
      />
    </div>
  );
}
