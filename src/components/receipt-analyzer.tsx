"use client";

import { useReceiptAnalysis } from "@/hooks/use-receipt-analysis";
import { useReceiptSession } from "@/hooks/use-receipt-session";
import type { SavedReceipt } from "@/lib/history/saved-receipt";
import { CaptureReceiptButton } from "./capture-receipt-button";
import { RecentReceipts } from "./history/recent-receipts";
import { HomeIntro } from "./home-intro";
import { ReadingReceipt } from "./reading-receipt";
import { ReceiptPhotoCollection } from "./receipt-photo-collection";
import { ReceiptResult } from "./receipt-result";
import { ActionButton } from "./ui/action-button";
import { NoticeBox } from "./ui/notice-box";

interface FreshReceiptProps {
  saved: SavedReceipt;
  photoUrls: string[];
  photos: File[];
  onNewReceipt: (photos: File[]) => void;
  onShowHistory: () => void;
}

/** Boleta recién leída: ya está guardada en el historial y se puede leer de nuevo con sus fotos. */
function FreshReceipt({ saved, ...props }: FreshReceiptProps) {
  const session = useReceiptSession(saved);
  return <ReceiptResult session={session} {...props} />;
}

/** Pantalla principal: fotografiar -> juntar fotos -> procesar -> ver resultado o error. */
export function ReceiptAnalyzer() {
  const {
    state,
    photoUrls,
    photoFiles,
    canAddPhotos,
    startNewReceipt,
    addPhotos,
    removePhoto,
    analyzePhotos,
  } = useReceiptAnalysis();

  if (state.status === "capturing" && photoUrls.length === 0) {
    return (
      <div className="space-y-10">
        <HomeIntro onPhotosSelected={startNewReceipt} />
        <RecentReceipts />
      </div>
    );
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
      {/* key: cada boleta nueva parte con sus correcciones en blanco. */}
      <FreshReceipt
        key={state.saved.id}
        saved={state.saved}
        photoUrls={photoUrls}
        photos={photoFiles}
        onNewReceipt={startNewReceipt}
        onShowHistory={() => startNewReceipt([])}
      />
    </div>
  );
}
