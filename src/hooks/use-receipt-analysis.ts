"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { requestReceiptAnalysis } from "@/lib/api/analyze-receipt-client";
import { resizeImageToJpeg } from "@/lib/image/resize-image";
import type { Receipt } from "@/lib/receipt/receipt-schema";

export type ReceiptAnalysisState =
  | { status: "idle" }
  | { status: "processing"; photoUrl: string }
  | { status: "done"; photoUrl: string; receipt: Receipt; providerName: string }
  | { status: "error"; photoUrl: string; message: string };

const UNKNOWN_ERROR_MESSAGE = "Ocurrió un error inesperado. Intenta de nuevo.";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
}

/** Orquesta el flujo foto -> reducción -> backend -> boleta, y libera las URLs de las fotos. */
export function useReceiptAnalysis() {
  const [state, setState] = useState<ReceiptAnalysisState>({ status: "idle" });
  const photoUrlRef = useRef<string | null>(null);

  const replacePhotoUrl = useCallback((nextUrl: string | null) => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = nextUrl;
  }, []);

  useEffect(() => () => replacePhotoUrl(null), [replacePhotoUrl]);

  const analyzePhoto = useCallback(
    async (photo: File) => {
      const photoUrl = URL.createObjectURL(photo);
      replacePhotoUrl(photoUrl);
      setState({ status: "processing", photoUrl });
      try {
        const resizedPhoto = await resizeImageToJpeg(photo);
        const result = await requestReceiptAnalysis(resizedPhoto);
        setState({ status: "done", photoUrl, ...result });
      } catch (error) {
        setState({ status: "error", photoUrl, message: toErrorMessage(error) });
      }
    },
    [replacePhotoUrl],
  );

  return { state, analyzePhoto };
}
