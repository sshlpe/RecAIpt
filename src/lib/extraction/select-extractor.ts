import { readOptionalEnv, readRequiredEnv } from "@/lib/config/read-env";
import { createClaudeExtractor, DEFAULT_CLAUDE_MODEL } from "./providers/claude-extractor";
import {
  createGeminiExtractor,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_THINKING_LEVEL,
  parseThinkingLevel,
} from "./providers/gemini-extractor";
import type { ReceiptExtractor } from "./receipt-extractor";

const EXTRACTOR_FACTORIES: Record<string, () => ReceiptExtractor> = {
  gemini: () =>
    createGeminiExtractor({
      apiKey: readRequiredEnv("GEMINI_API_KEY"),
      model: readOptionalEnv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL),
      thinkingLevel: parseThinkingLevel(
        readOptionalEnv("GEMINI_THINKING_LEVEL", DEFAULT_GEMINI_THINKING_LEVEL),
      ),
    }),
  claude: () =>
    createClaudeExtractor({
      apiKey: readRequiredEnv("ANTHROPIC_API_KEY"),
      model: readOptionalEnv("CLAUDE_MODEL", DEFAULT_CLAUDE_MODEL),
    }),
};

/** Devuelve el extractor configurado en LLM_PROVIDER (por defecto, Gemini: capa gratuita). */
export function selectReceiptExtractor(): ReceiptExtractor {
  const providerName = readOptionalEnv("LLM_PROVIDER", "gemini").toLowerCase();
  const createExtractor = EXTRACTOR_FACTORIES[providerName];
  if (!createExtractor) {
    const available = Object.keys(EXTRACTOR_FACTORIES).join(", ");
    throw new Error(`LLM_PROVIDER "${providerName}" no existe. Opciones: ${available}.`);
  }
  return createExtractor();
}
