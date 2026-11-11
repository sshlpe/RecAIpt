import type { ReceiptCorrection } from "@/lib/receipt/receipt-corrections";

function CorrectionRow({ correction }: { correction: ReceiptCorrection }) {
  const { label, before, after } = correction;
  return (
    <li className="space-y-1 border-b-2 border-surface py-3">
      <p className="text-lg font-bold break-words">{label}</p>
      {before === null && <p className="text-base">Agregado: {after}</p>}
      {after === null && <p className="text-base">Quitado: {before}</p>}
      {before !== null && after !== null && (
        <>
          <p className="text-base text-muted">Leído: {before}</p>
          <p className="text-base">Corregido: {after}</p>
        </>
      )}
    </li>
  );
}

/** Qué se corrigió respecto de lo que leyó la IA. */
export function CorrectionsList({ corrections }: { corrections: ReceiptCorrection[] }) {
  return (
    <section className="space-y-2" aria-labelledby="corrections-title">
      <h2 id="corrections-title" className="text-lg font-extrabold">
        Correcciones
      </h2>
      {corrections.length === 0 ? (
        <p className="text-base text-muted">Ninguna: se usó lo que leyó la app.</p>
      ) : (
        <ul>
          {corrections.map((correction, index) => (
            <CorrectionRow key={`${correction.label}-${index}`} correction={correction} />
          ))}
        </ul>
      )}
    </section>
  );
}
