/** Foto original de la boleta, para comparar la transcripción con el papel. */
export function OriginalPhoto({ photoUrl }: { photoUrl: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- URL local (blob:), no optimizable
    <img src={photoUrl} alt="Foto de la boleta" className="w-full rounded-xl" />
  );
}
