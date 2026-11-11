/** Fotos originales de la boleta, en orden, para comparar la transcripción con el papel. */
export function OriginalPhotos({ photoUrls }: { photoUrls: string[] }) {
  const isSingle = photoUrls.length === 1;
  return (
    <div className="space-y-4">
      {photoUrls.map((photoUrl, index) => (
        <figure key={photoUrl} className="space-y-2">
          {!isSingle && (
            <figcaption className="text-lg font-bold">
              Foto {index + 1} de {photoUrls.length}
            </figcaption>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- URL local (blob:), no optimizable */}
          <img
            src={photoUrl}
            alt={isSingle ? "Foto de la boleta" : `Foto ${index + 1} de la boleta`}
            className="w-full rounded-xl"
          />
        </figure>
      ))}
    </div>
  );
}
