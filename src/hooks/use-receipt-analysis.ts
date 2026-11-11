"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_RECEIPT_IMAGES } from "@/lib/api/analyze-receipt-contract";
import { readReceiptPhotos } from "@/lib/api/analyze-receipt-client";
import { toErrorMessage } from "@/lib/errors/error-message";
import { createSavedReceipt, type SavedReceipt } from "@/lib/history/saved-receipt";

/** Foto tomada por el usuario y la URL local para mostrarla. */
export interface CapturedPhoto {
  file: File;
  url: string;
}

export type ReceiptAnalysisState =
  | { status: "capturing" }
  | { status: "processing" }
  | { status: "done"; saved: SavedReceipt; providerName: string }
  | { status: "error"; message: string };

const UNKNOWN_ERROR_MESSAGE = "Ocurrió un error inesperado. Intenta de nuevo.";

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
  // Sube con cada boleta nueva: una lectura que termina tarde (de la anterior) se descarta.
  const receiptVersionRef = useRef(0);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => () => revokePhotoUrls(photosRef.current), []);

  /** Descarta la boleta actual y empieza una nueva con estas fotos (sin fotos = inicio). */
  const startNewReceipt = useCallback((files: File[]) => {
    receiptVersionRef.current += 1;
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
    const version = receiptVersionRef.current;
    const isCurrent = () => version === receiptVersionRef.current;
    try {
      const { receipt, providerName } = await readReceiptPhotos(
        photosRef.current.map((photo) => photo.file),
      );
      if (isCurrent())
        setState({ status: "done", saved: createSavedReceipt(receipt), providerName });
    } catch (error) {
      if (isCurrent()) {
        setState({ status: "error", message: toErrorMessage(error, UNKNOWN_ERROR_MESSAGE) });
      }
    }
  }, []);

  const photoUrls = photos.map((photo) => photo.url);
  const photoFiles = photos.map((photo) => photo.file);
  const canAddPhotos = photos.length < MAX_RECEIPT_IMAGES;

  return {
    state,
    photoUrls,
    photoFiles,
    canAddPhotos,
    startNewReceipt,
    addPhotos,
    removePhoto,
    analyzePhotos,
  };
}
