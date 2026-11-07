import { MissingConfigError } from "@/lib/config/read-env";
import type { AnalyzeReceiptFailure } from "./analyze-receipt-contract";
import { InvalidRequestError } from "./read-receipt-image";

const GENERIC_ERROR_MESSAGE = "No pudimos leer la boleta. Intenta con otra foto.";
const RATE_LIMIT_ERROR_MESSAGE =
  "Se hicieron muchas lecturas seguidas. Espera un minuto e intenta de nuevo.";
const TIMEOUT_ERROR_MESSAGE =
  "La lectura tardó demasiado (el servicio puede estar saturado). Intenta de nuevo en un momento.";

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message } satisfies AnalyzeReceiptFailure, { status });
}

/** Cubre el AbortError del SDK de Gemini y el APIConnectionTimeoutError del de Anthropic. */
function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && /abort|timeout/i.test(error.name);
}

/** Cuota del proveedor agotada (HTTP 429): ApiError de Gemini y RateLimitError de Anthropic. */
function isRateLimitError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && error.status === 429;
}

/** Traduce cualquier error del flujo a una respuesta HTTP con mensaje entendible. */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof InvalidRequestError) return jsonError(error.message, 400);
  console.error("[analyze-receipt]", error);
  if (error instanceof MissingConfigError) return jsonError(error.message, 500);
  if (isRateLimitError(error)) return jsonError(RATE_LIMIT_ERROR_MESSAGE, 429);
  if (isTimeoutError(error)) return jsonError(TIMEOUT_ERROR_MESSAGE, 504);
  // ReceiptExtractionError y errores del proveedor (red, cuota, API key inválida).
  return jsonError(GENERIC_ERROR_MESSAGE, 502);
}
