import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Nombre del binding declarado en `ratelimits` de wrangler.jsonc. */
const RATE_LIMITER_BINDING = "RECEIPT_RATE_LIMITER";

/** Forma del binding de Rate Limiting de Cloudflare Workers. */
interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** El cliente superó el límite de lecturas. `status` la trata igual que un 429 del proveedor. */
export class RateLimitedError extends Error {
  readonly status = 429;

  constructor() {
    super("Límite de lecturas por minuto superado.");
    this.name = "RateLimitedError";
  }
}

/** El binding solo existe en Cloudflare; en `next dev` no hay contexto y no se limita. */
function readRateLimiter(): RateLimiterBinding | undefined {
  try {
    const env = getCloudflareContext().env as unknown as Record<string, unknown>;
    return env[RATE_LIMITER_BINDING] as RateLimiterBinding | undefined;
  } catch {
    return undefined;
  }
}

/**
 * Protege la cuota del LLM: si la URL es pública, cualquiera podría gastarla.
 * Limita por IP del cliente (Cloudflare la entrega en `cf-connecting-ip`).
 */
export async function enforceRateLimit(request: Request): Promise<void> {
  const limiter = readRateLimiter();
  if (!limiter) return;
  const clientIp = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await limiter.limit({ key: clientIp });
  if (!success) throw new RateLimitedError();
}
