"use client";

import { useElapsedSeconds } from "@/hooks/use-elapsed-seconds";
import { ReceiptPaper } from "./ui/receipt-paper";

/** Pasado este tiempo se avisa que va lento, para que no parezca que la app se colgó. */
const SLOW_READING_SECONDS = 25;

/** Mientras la IA lee: la foto propia con una franja de luz que la recorre, y el tiempo. */
export function ReadingReceipt({ photoUrl }: { photoUrl: string }) {
  const elapsedSeconds = useElapsedSeconds();
  const isSlow = elapsedSeconds >= SLOW_READING_SECONDS;

  return (
    <div className="space-y-5" role="status">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Leyendo tu boleta…</h1>
        <p className="shrink-0 font-mono text-lg text-muted tabular-nums" aria-hidden>
          {elapsedSeconds} s
        </p>
      </div>
      <ReceiptPaper>
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- URL local (blob:), no optimizable */}
          <img
            src={photoUrl}
            alt="Tu boleta, mientras se lee"
            className="max-h-[55dvh] w-full object-cover object-top"
          />
          <div aria-hidden className="receipt-scan-line" />
        </div>
      </ReceiptPaper>
      <p className="text-base text-muted" aria-live="polite">
        {isSlow
          ? "Está tardando más de lo normal. Puedes seguir esperando."
          : "Suele tomar entre 10 y 20 segundos."}
      </p>
    </div>
  );
}
