/** Lado mayor máximo: suficiente para leer boletas largas, liviano para enviar. */
const MAX_IMAGE_SIDE_PX = 2000;
const JPEG_QUALITY = 0.85;

function calculateScale(width: number, height: number, maxSide: number): number {
  return Math.min(1, maxSide / Math.max(width, height));
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen."))),
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Reduce la foto en el teléfono antes de enviarla (menos tokens, menos latencia) y la
 * convierte a JPEG, corrigiendo la orientación EXIF de la cámara.
 */
export async function resizeImageToJpeg(file: Blob, maxSide = MAX_IMAGE_SIDE_PX): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = calculateScale(bitmap.width, bitmap.height, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToJpegBlob(canvas, JPEG_QUALITY);
}
