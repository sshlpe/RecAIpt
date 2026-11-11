"use client";

import { useActiveReceipt } from "./active-receipt-provider";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { HomeIntro } from "./home-intro";
import { ReadingReceipt } from "./reading-receipt";
import { ReceiptPhotoCollection } from "./receipt-photo-collection";
import { ReceiptResult } from "./receipt-result";
import { ActionButton } from "./ui/action-button";
import { NoticeBox } from "./ui/notice-box";

/**
 * Pantalla principal: fotografiar -> juntar fotos -> procesar -> ver resultado o error.
 * El estado vive en ActiveReceiptProvider: ir al historial y volver no lo pierde.
 */
export function ReceiptAnalyzer() {
  const { analysis, session } = useActiveReceipt();
  const { state, photoUrls, photoFiles, canAddPhotos, startNewReceipt } = analysis;

  if (state.status === "capturing" && photoUrls.length === 0) {
    return <HomeIntro onPhotosSelected={startNewReceipt} />;
  }
  if (state.status === "capturing") {
    return (
      <ReceiptPhotoCollection
        photoUrls={photoUrls}
        canAddPhotos={canAddPhotos}
        onAddPhotos={analysis.addPhotos}
        onRemovePhoto={analysis.removePhoto}
        onRead={analysis.analyzePhotos}
      />
    );
  }
  // La primera foto basta como referencia visual mientras se lee.
  if (state.status === "processing") return <ReadingReceipt photoUrl={photoUrls[0]} />;

  if (state.status === "error" || !session) {
    return (
      <div className="space-y-6">
        <NoticeBox tone="warning" title="No pudimos leer la boleta">
          <p>{state.status === "error" ? state.message : null}</p>
        </NoticeBox>
        <ActionButton onClick={analysis.analyzePhotos}>Intentar de nuevo</ActionButton>
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
    <div className="pb-28">
      <ReceiptResult session={session} photoUrls={photoUrls} photos={photoFiles} />
    </div>
  );
}
