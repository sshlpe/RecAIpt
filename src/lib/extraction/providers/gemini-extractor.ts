import {
  GoogleGenAI,
  PartMediaResolutionLevel,
  ThinkingLevel,
  createPartFromBase64,
} from "@google/genai";
import { z } from "zod";
import { receiptSchema } from "@/lib/receipt/receipt-schema";
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from "../extraction-prompt";
import {
  ReceiptExtractionError,
  type ReceiptExtractor,
  type ReceiptImage,
} from "../receipt-extractor";
import { MAX_ATTEMPTS, MAX_RETRY_DELAY_SECONDS, REQUEST_TIMEOUT_MS } from "../request-limits";

/** Versión fija: los alias "-latest" se saturan más y cambian de modelo sin aviso. */
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

/**
 * Cuánto "piensa" el modelo antes de responder (solo modelos Gemini 3.x).
 * Medido con una boleta impresa: por defecto 17 s, LOW 10 s, MINIMAL 8 s, misma precisión.
 * LOW deja algo de margen para boletas manuscritas.
 */
export const DEFAULT_GEMINI_THINKING_LEVEL = ThinkingLevel.LOW;

/**
 * Gemini 3 reduce cada imagen a un presupuesto fijo de tokens (~1120 por defecto) sin importar
 * cuántos píxeles le mandemos. ULTRA_HIGH (~2240) conserva la letra chica de boletas largas;
 * el costo extra son ~1000 tokens de entrada por boleta. Los modelos 2.x ignoran el campo.
 */
const RECEIPT_IMAGE_RESOLUTION = PartMediaResolutionLevel.MEDIA_RESOLUTION_ULTRA_HIGH;

/** `thinkingLevel` existe desde Gemini 3; los modelos 2.x lo rechazan con un 400. */
const FIRST_MODEL_GENERATION_WITH_THINKING_LEVEL = 3;

function supportsThinkingLevel(model: string): boolean {
  const generation = Number(model.match(/^gemini-(\d+)/)?.[1]);
  return generation >= FIRST_MODEL_GENERATION_WITH_THINKING_LEVEL;
}

/** Nivel de razonamiento solo si el modelo lo soporta; si no, el modelo usa su valor por defecto. */
function buildThinkingConfig(model: string, thinkingLevel: ThinkingLevel) {
  return supportsThinkingLevel(model) ? { thinkingConfig: { thinkingLevel } } : {};
}

interface GeminiExtractorConfig {
  apiKey: string;
  model: string;
  thinkingLevel: ThinkingLevel;
}

/** Convierte el texto de configuración ("low", "MINIMAL"...) al enum del SDK. */
export function parseThinkingLevel(value: string): ThinkingLevel {
  const level = value.toUpperCase();
  const validLevels = Object.values(ThinkingLevel) as string[];
  if (!validLevels.includes(level)) {
    throw new Error(
      `GEMINI_THINKING_LEVEL "${value}" no existe. Opciones: ${validLevels.join(", ")}.`,
    );
  }
  return level as ThinkingLevel;
}

/** JSON Schema derivado del schema Zod (sin "$schema", que Gemini no necesita). */
function buildReceiptJsonSchema() {
  const jsonSchema: Record<string, unknown> = { ...z.toJSONSchema(receiptSchema) };
  delete jsonSchema.$schema;
  return jsonSchema;
}

const RECEIPT_JSON_SCHEMA = buildReceiptJsonSchema();

function parseReceiptJson(text: string | undefined) {
  if (!text) throw new ReceiptExtractionError("El modelo devolvió una respuesta vacía.");
  try {
    return receiptSchema.parse(JSON.parse(text));
  } catch (error) {
    throw new ReceiptExtractionError("La respuesta no cumple el formato de boleta.", {
      cause: error,
    });
  }
}

export function createGeminiExtractor({
  apiKey,
  model,
  thinkingLevel,
}: GeminiExtractorConfig): ReceiptExtractor {
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: REQUEST_TIMEOUT_MS,
      retryOptions: { attempts: MAX_ATTEMPTS, maxDelay: MAX_RETRY_DELAY_SECONDS },
    },
  });

  return {
    providerName: supportsThinkingLevel(model)
      ? `gemini (${model}, thinking ${thinkingLevel})`
      : `gemini (${model})`,

    async extractReceipt(images: ReceiptImage[]) {
      const response = await client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              ...images.map((image) =>
                createPartFromBase64(image.base64Data, image.mimeType, RECEIPT_IMAGE_RESOLUTION),
              ),
              { text: buildExtractionUserPrompt(images.length) },
            ],
          },
        ],
        config: {
          systemInstruction: EXTRACTION_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: RECEIPT_JSON_SCHEMA,
          ...buildThinkingConfig(model, thinkingLevel),
        },
      });
      return parseReceiptJson(response.text);
    },
  };
}
