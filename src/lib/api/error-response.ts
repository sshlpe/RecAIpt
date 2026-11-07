import { MissingConfigError } from "@/lib/config/read-env";
import type { AnalyzeReceiptFailure } from "./analyze-receipt-contract";
import { RateLimitedError } from "./rate-limit";
import { InvalidRequestError } from "./read-receipt-image";

const GENERIC_ERROR_MESSAGE = "No pudimos leer la boleta. Intenta con otra foto.";
/** El detalle (qué variable falta) va solo al log: la URL es pública. */
const SERVICE_UNAVAILABLE_MESSAGE = "El servicio no está disponible en este momento.";
/** Nuestro límite por IP (ver rate-limit.ts). */
const CLIENT_RATE_LIMIT_MESSAGE =
  "Hiciste muchas lecturas seguidas. Espera un minuto e intenta de nuevo (máximo 10 por minuto).";
/** Cuota del proveedor de IA: no depende de cuánto leyó esta persona. */
const PROVIDER_QUOTA_MESSAGE =
  "El servicio de lectura alcanzó su límite por ahora. Intenta de nuevo en unos minutos.";
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
function isProviderQuotaError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && error.status === 429;
}

/** Traduce cualquier error del flujo a una respuesta HTTP con mensaje entendible. */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof InvalidRequestError) return jsonError(error.message, 400);
  if (error instanceof RateLimitedError) return jsonError(CLIENT_RATE_LIMIT_MESSAGE, 429);
  console.error("[analyze-receipt]", error);
  if (error instanceof MissingConfigError) return jsonError(SERVICE_UNAVAILABLE_MESSAGE, 500);
  if (isProviderQuotaError(error)) return jsonError(PROVIDER_QUOTA_MESSAGE, 503);
  if (isTimeoutError(error)) return jsonError(TIMEOUT_ERROR_MESSAGE, 504);
  // ReceiptExtractionError y otros errores del proveedor (red, API key inválida).
  return jsonError(GENERIC_ERROR_MESSAGE, 502);
}
