import type { Receipt } from "@/lib/receipt/receipt-schema";

export const SUPPORTED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export interface ReceiptImage {
  base64Data: string;
  mimeType: SupportedImageMimeType;
}

/**
 * Contrato que cumple cada proveedor de LLM: fotos de UNA boleta (en orden) -> Receipt validado.
 * Todas las fotos van en una sola llamada para que el modelo descarte las líneas repetidas
 * por superposición.
 */
export interface ReceiptExtractor {
  readonly providerName: string;
  extractReceipt(images: ReceiptImage[]): Promise<Receipt>;
}

/** El modelo respondió, pero no se pudo obtener una boleta válida de su respuesta. */
export class ReceiptExtractionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ReceiptExtractionError";
  }
}

export function isSupportedImageMimeType(mimeType: string): mimeType is SupportedImageMimeType {
  return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}
