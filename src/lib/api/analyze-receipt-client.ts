import {
  ANALYZE_RECEIPT_ENDPOINT,
  RECEIPT_IMAGE_FIELD,
  type AnalyzeReceiptFailure,
  type AnalyzeReceiptSuccess,
} from "./analyze-receipt-contract";

const NETWORK_ERROR_MESSAGE = "No hay conexión. Revisa internet e intenta de nuevo.";

/** Envía la imagen de la boleta al backend y devuelve la boleta transcrita. */
export async function requestReceiptAnalysis(image: Blob): Promise<AnalyzeReceiptSuccess> {
  const formData = new FormData();
  formData.append(RECEIPT_IMAGE_FIELD, image, "boleta.jpg");

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
