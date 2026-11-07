import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { receiptSchema } from "@/lib/receipt/receipt-schema";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from "../extraction-prompt";
import {
  ReceiptExtractionError,
  type ReceiptExtractor,
  type ReceiptImage,
} from "../receipt-extractor";
import { MAX_ATTEMPTS, REQUEST_TIMEOUT_MS } from "../request-limits";

export const DEFAULT_CLAUDE_MODEL = "claude-opus-5-5";

/** Modelos que aceptan reintento automático en otro modelo si el primero rechaza la solicitud. */
const MODELS_WITH_SERVER_FALLBACK = new Set([
  "claude-fable-5-1",
  "claude-opus-5-5",
  "claude-opus-5",
  "claude-sonnet-5-5",
]);
const SERVER_FALLBACK_BETA = "server-side-fallback-2026-07-01";
const MAX_OUTPUT_TOKENS = 16000;

interface ClaudeExtractorConfig {
  apiKey: string;
  model: string;
}

function buildFallbackParams(model: string) {
  if (!MODELS_WITH_SERVER_FALLBACK.has(model)) return {};
  return { betas: [SERVER_FALLBACK_BETA], fallbacks: "default" as const };
}

export function createClaudeExtractor({ apiKey, model }: ClaudeExtractorConfig): ReceiptExtractor {
  const client = new Anthropic({
    apiKey,
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: MAX_ATTEMPTS - 1,
  });

  return {
    providerName: `claude (${model})`,

    async extractReceipt(image: ReceiptImage) {
      const response = await client.beta.messages.parse({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        ...buildFallbackParams(model),
        system: EXTRACTION_SYSTEM_PROMPT,
        output_config: { effort: "medium", format: betaZodOutputFormat(receiptSchema) },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: image.mimeType, data: image.base64Data },
              },
              { type: "text", text: EXTRACTION_USER_PROMPT },
            ],
          },
        ],
      });

      if (response.stop_reason === "refusal") {
        throw new ReceiptExtractionError("El modelo rechazó procesar la imagen.");
      }
      if (!response.parsed_output) {
        throw new ReceiptExtractionError(`Respuesta sin datos válidos (${response.stop_reason}).`);
      }
      return response.parsed_output;
    },
  };
}
