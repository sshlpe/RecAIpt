import type { Receipt } from "@/lib/receipt/receipt-schema";

/** Contrato compartido entre el route handler y el cliente del frontend. */

export const ANALYZE_RECEIPT_ENDPOINT = "/api/analyze-receipt";
export const RECEIPT_IMAGE_FIELD = "image";
export const MAX_RECEIPT_IMAGE_BYTES = 8 * 1024 * 1024;

export interface AnalyzeReceiptSuccess {
  receipt: Receipt;
  providerName: string;
}

export interface AnalyzeReceiptFailure {
  error: string;
}
