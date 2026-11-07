/** Fotos originales de la boleta, en orden, para comparar la transcripción con el papel. */
export function OriginalPhotos({ photoUrls }: { photoUrls: string[] }) {
  const isSingle = photoUrls.length === 1;
  return (
    <div className="space-y-4">
      {photoUrls.map((photoUrl, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- URL local (blob:), no optimizable
        <img
          key={photoUrl}
          src={photoUrl}
          alt={isSingle ? "Foto de la boleta" : `Foto ${index + 1} de la boleta`}
          className="w-full rounded-xl"
        />
      ))}
    </div>
  );
}
