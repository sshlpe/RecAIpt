"use client";

import { CaptureReceiptButton } from "./capture-receipt-button";
import { ActionButton } from "./ui/action-button";
import { IconButton } from "./ui/icon-button";

interface ReceiptPhotoCollectionProps {
  photoUrls: string[];
  canAddPhotos: boolean;
  onAddPhotos: (photos: File[]) => void;
  onRemovePhoto: (url: string) => void;
  onRead: () => void;
}

/**
 * Paso entre la foto y la lectura: pregunta si la boleta sigue (larga o con reverso) para
 * juntar todas las fotos y leerlas juntas.
 */
export function ReceiptPhotoCollection({
  photoUrls,
  canAddPhotos,
  onAddPhotos,
  onRemovePhoto,
  onRead,
}: ReceiptPhotoCollectionProps) {
  const photoCount = photoUrls.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold">¿La boleta sigue?</h1>
        <p className="text-lg text-muted">
          Si es larga o tiene algo escrito atrás, saca otra foto. Conviene que cada foto repita
          un poco el final de la anterior.
        </p>
      </div>
      <ol className="grid grid-cols-2 gap-3" aria-label="Fotos de la boleta">
        {photoUrls.map((photoUrl, index) => (
          <li key={photoUrl} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL local (blob:) */}
            <img
              src={photoUrl}
              alt={`Foto ${index + 1}`}
              className="aspect-[3/4] w-full rounded-xl border-2 border-border object-cover"
            />
            <span className="absolute top-2 left-2 rounded-full bg-background px-3 py-1 font-bold">
              {index + 1}
            </span>
            <div className="absolute top-1 right-1">
              <IconButton
                icon="✕"
                label={`Quitar foto ${index + 1}`}
                onClick={() => onRemovePhoto(photoUrl)}
              />
            </div>
          </li>
        ))}
      </ol>
      <ActionButton onClick={onRead}>
        {photoCount === 1 ? "Leer boleta" : `Leer boleta (${photoCount} fotos)`}
      </ActionButton>
      {canAddPhotos && (
        <CaptureReceiptButton
          label="Agregar otra foto"
          variant="secondary"
          onPhotosSelected={onAddPhotos}
        />
      )}
    </div>
  );
}
