import { CaptureReceiptButton } from "./capture-receipt-button";
import { ReceiptLine, ReceiptPaper } from "./ui/receipt-paper";

/** Lo que hace la app, contado como líneas de una boleta. */
const WHAT_IT_DOES = ["Letra grande", "Lo repetido, agrupado", "La suma, revisada"];

/** Pantalla inicial: una boleta que explica la app y el botón para fotografiar la propia. */
export function HomeIntro({ onPhotoSelected }: { onPhotoSelected: (photo: File) => void }) {
  return (
    <div className="space-y-6">
      <ReceiptPaper>
        <h1 className="text-3xl leading-tight font-extrabold text-balance">
          Saca una foto a tu boleta
        </h1>
        <ul className="mt-6 space-y-3" aria-label="Qué hace la app">
          {WHAT_IT_DOES.map((label) => (
            <ReceiptLine key={label} label={label} value="✓" />
          ))}
        </ul>
      </ReceiptPaper>
      <CaptureReceiptButton label="Fotografiar boleta" onPhotoSelected={onPhotoSelected} />
      <p className="text-center text-base text-muted">
        Con buena luz y la boleta entera en la foto.
      </p>
    </div>
  );
}
