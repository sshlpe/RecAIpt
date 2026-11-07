import { isSupportedImageMimeType, type ReceiptImage } from "@/lib/extraction/receipt-extractor";
import {
  MAX_RECEIPT_IMAGE_BYTES,
  MAX_RECEIPT_IMAGES,
  RECEIPT_IMAGE_FIELD,
} from "./analyze-receipt-contract";

/** La solicitud del cliente es inválida (se responde 400). */
export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRequestError";
  }
}

async function readImageFiles(request: Request): Promise<File[]> {
  const formData = await request.formData().catch(() => {
    throw new InvalidRequestError("La solicitud debe enviarse como formulario con imágenes.");
  });
  const files = formData.getAll(RECEIPT_IMAGE_FIELD).filter((entry) => entry instanceof File);
  if (files.length === 0) {
    throw new InvalidRequestError(`Falta la imagen en el campo "${RECEIPT_IMAGE_FIELD}".`);
  }
  if (files.length > MAX_RECEIPT_IMAGES) {
    throw new InvalidRequestError(`Máximo ${MAX_RECEIPT_IMAGES} fotos por boleta.`);
  }
  return files;
}

function assertValidImage(file: File): asserts file is File & { type: ReceiptImage["mimeType"] } {
  if (!isSupportedImageMimeType(file.type)) {
    throw new InvalidRequestError(`Formato de imagen no soportado: ${file.type || "desconocido"}.`);
  }
  if (file.size > MAX_RECEIPT_IMAGE_BYTES) {
    throw new InvalidRequestError("La imagen es demasiado grande.");
  }
}

async function toReceiptImage(file: File): Promise<ReceiptImage> {
  assertValidImage(file);
  const base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { base64Data, mimeType: file.type };
}

/** Lee y valida las fotos de la boleta (en el orden en que se enviaron) desde un multipart. */
export async function readReceiptImages(request: Request): Promise<ReceiptImage[]> {
  const files = await readImageFiles(request);
  return Promise.all(files.map(toReceiptImage));
}
