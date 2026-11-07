"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_RECEIPT_IMAGES } from "@/lib/api/analyze-receipt-contract";
import { requestReceiptAnalysis } from "@/lib/api/analyze-receipt-client";
import { resizeImageToJpeg } from "@/lib/image/resize-image";
import type { Receipt } from "@/lib/receipt/receipt-schema";

/** Foto tomada por el usuario y la URL local para mostrarla. */
export interface CapturedPhoto {
  file: File;
  url: string;
}

export type ReceiptAnalysisState =
  | { status: "capturing" }
  | { status: "processing" }
  | { status: "done"; receipt: Receipt; providerName: string }
  | { status: "error"; message: string };

const UNKNOWN_ERROR_MESSAGE = "Ocurrió un error inesperado. Intenta de nuevo.";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
}

function toCapturedPhotos(files: File[]): CapturedPhoto[] {
  return files.map((file) => ({ file, url: URL.createObjectURL(file) }));
}

function revokePhotoUrls(photos: CapturedPhoto[]): void {
  photos.forEach((photo) => URL.revokeObjectURL(photo.url));
}

/**
 * Orquesta el flujo fotos -> reducción -> backend -> boleta. Una boleta puede tener varias
 * fotos (larga, o con reverso): se juntan primero y se leen todas en una sola llamada.
 */
export function useReceiptAnalysis() {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [state, setState] = useState<ReceiptAnalysisState>({ status: "capturing" });
  // Espejo de `photos` para los callbacks (estables) y para liberar las URLs al desmontar.
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => () => revokePhotoUrls(photosRef.current), []);

  /** Descarta la boleta actual y empieza una nueva con estas fotos. */
  const startNewReceipt = useCallback((files: File[]) => {
    revokePhotoUrls(photosRef.current);
    setPhotos(toCapturedPhotos(files.slice(0, MAX_RECEIPT_IMAGES)));
    setState({ status: "capturing" });
  }, []);

  /** Agrega fotos a la boleta en curso (otra parte o el reverso), hasta el máximo. */
  const addPhotos = useCallback((files: File[]) => {
    setPhotos((current) => {
      const room = MAX_RECEIPT_IMAGES - current.length;
      return [...current, ...toCapturedPhotos(files.slice(0, Math.max(0, room)))];
    });
  }, []);

  const removePhoto = useCallback((url: string) => {
    URL.revokeObjectURL(url);
    setPhotos((current) => current.filter((photo) => photo.url !== url));
  }, []);

  const analyzePhotos = useCallback(async () => {
    setState({ status: "processing" });
    try {
      const resizedPhotos = await Promise.all(
        photosRef.current.map((photo) => resizeImageToJpeg(photo.file)),
      );
      const result = await requestReceiptAnalysis(resizedPhotos);
      setState({ status: "done", ...result });
    } catch (error) {
      setState({ status: "error", message: toErrorMessage(error) });
    }
  }, []);

  const photoUrls = photos.map((photo) => photo.url);
  const canAddPhotos = photos.length < MAX_RECEIPT_IMAGES;

  return {
    state,
    photoUrls,
    canAddPhotos,
    startNewReceipt,
    addPhotos,
    removePhoto,
    analyzePhotos,
  };
}
