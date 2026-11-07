import type { AnalyzeReceiptSuccess } from "@/lib/api/analyze-receipt-contract";
import { toErrorResponse } from "@/lib/api/error-response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { readReceiptImages } from "@/lib/api/read-receipt-image";
import { selectReceiptExtractor } from "@/lib/extraction/select-extractor";

/** Leer una boleta manuscrita puede tardar varios segundos. */
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    await enforceRateLimit(request);
    const images = await readReceiptImages(request);
    const extractor = selectReceiptExtractor();
    const receipt = await extractor.extractReceipt(images);
    return Response.json({
      receipt,
      providerName: extractor.providerName,
    } satisfies AnalyzeReceiptSuccess);
  } catch (error) {
    return toErrorResponse(error);
  }
}
