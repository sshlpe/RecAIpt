import { resizeImageToJpeg } from "@/lib/image/resize-image";
import {
  ANALYZE_RECEIPT_ENDPOINT,
  RECEIPT_IMAGE_FIELD,
  type AnalyzeReceiptFailure,
  type AnalyzeReceiptSuccess,
} from "./analyze-receipt-contract";

const NETWORK_ERROR_MESSAGE = "No hay conexión. Revisa internet e intenta de nuevo.";

/** Envía las fotos de la boleta (en orden) al backend y devuelve la boleta transcrita. */
export async function requestReceiptAnalysis(images: Blob[]): Promise<AnalyzeReceiptSuccess> {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(RECEIPT_IMAGE_FIELD, image, `boleta-${index + 1}.jpg`);
  });

  const response = await fetch(ANALYZE_RECEIPT_ENDPOINT, { method: "POST", body: formData }).catch(
    () => {
      throw new Error(NETWORK_ERROR_MESSAGE);
    },
  );
  const body: AnalyzeReceiptSuccess | AnalyzeReceiptFailure = await response.json();
  if (!response.ok || "error" in body) {
    throw new Error("error" in body ? body.error : `Error ${response.status}`);
  }
  return body;
}

/** Reduce las fotos en el teléfono y las envía a leer: lo que hace "leer" y "leer de nuevo". */
export async function readReceiptPhotos(photos: Blob[]): Promise<AnalyzeReceiptSuccess> {
  const resizedPhotos = await Promise.all(photos.map((photo) => resizeImageToJpeg(photo)));
  return requestReceiptAnalysis(resizedPhotos);
}
