import { isSupportedImageMimeType, type ReceiptImage } from "@/lib/extraction/receipt-extractor";
import { MAX_RECEIPT_IMAGE_BYTES, RECEIPT_IMAGE_FIELD } from "./analyze-receipt-contract";

/** La solicitud del cliente es inválida (se responde 400). */
export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRequestError";
  }
}

async function readImageFile(request: Request): Promise<File> {
  const formData = await request.formData().catch(() => {
    throw new InvalidRequestError("La solicitud debe enviarse como formulario con una imagen.");
  });
  const file = formData.get(RECEIPT_IMAGE_FIELD);
  if (!(file instanceof File)) {
    throw new InvalidRequestError(`Falta la imagen en el campo "${RECEIPT_IMAGE_FIELD}".`);
  }
  return file;
}

function assertValidImage(file: File): asserts file is File & { type: ReceiptImage["mimeType"] } {
  if (!isSupportedImageMimeType(file.type)) {
    throw new InvalidRequestError(`Formato de imagen no soportado: ${file.type || "desconocido"}.`);
  }
  if (file.size > MAX_RECEIPT_IMAGE_BYTES) {
    throw new InvalidRequestError("La imagen es demasiado grande.");
  }
}

/** Lee y valida la imagen de la boleta desde un request multipart. */
export async function readReceiptImage(request: Request): Promise<ReceiptImage> {
  const file = await readImageFile(request);
  assertValidImage(file);
  const base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { base64Data, mimeType: file.type };
}
