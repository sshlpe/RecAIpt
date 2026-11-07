/**
 * Tope por cantidad de píxeles, no por lado mayor: una boleta larga fotografiada entera ocupa
 * una franja angosta del cuadro, y limitar el lado mayor dejaba el texto en ~9 px por carácter.
 * 6 MP en JPEG 0.85 pesa ~1,5-3 MB, bajo el límite de la API (MAX_RECEIPT_IMAGE_BYTES).
 */
const MAX_IMAGE_PIXELS = 6_000_000;
const JPEG_QUALITY = 0.85;

function calculateScale(width: number, height: number, maxPixels: number): number {
  return Math.min(1, Math.sqrt(maxPixels / (width * height)));
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
export async function resizeImageToJpeg(
  file: Blob,
  maxPixels = MAX_IMAGE_PIXELS,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = calculateScale(bitmap.width, bitmap.height, maxPixels);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToJpegBlob(canvas, JPEG_QUALITY);
}
