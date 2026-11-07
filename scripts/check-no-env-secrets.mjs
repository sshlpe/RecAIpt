/**
 * Corre antes de `npm run deploy`.
 * El adaptador de Cloudflare (OpenNext) copia el contenido de TODOS los archivos .env* dentro
 * del código del Worker (.open-next/cloudflare/next-env.mjs). Si hay API keys en esos archivos,
 * quedarían empaquetadas en el código desplegado. Las keys van como secrets de Cloudflare
 * (`npx wrangler secret put GEMINI_API_KEY`), nunca en el bundle.
 */
import { existsSync, readFileSync } from "node:fs";

/** Los mismos archivos que lee el adaptador (modos production, development y test). */
const ENV_FILES = [".env", ".env.local"].concat(
  ["production", "development", "test"].flatMap((mode) => [`.env.${mode}`, `.env.${mode}.local`]),
);
const SECRET_NAME_PATTERN = /KEY|SECRET|TOKEN|PASSWORD/i;

/** Nombres de variables con aspecto de secreto y valor no vacío (nunca se imprimen los valores). */
function findSecretNames(filePath) {
  return readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/))
    .filter((match) => match && SECRET_NAME_PATTERN.test(match[1]) && match[2].replace(/["']/g, ""))
    .map((match) => match[1]);
}

const findings = ENV_FILES.filter((file) => existsSync(file)).flatMap((file) =>
  findSecretNames(file).map((name) => `${file}: ${name}`),
);

if (findings.length > 0) {
  console.error(
    `\n✖ No se publica: estas variables quedarían empaquetadas en el código del Worker:\n` +
      findings.map((finding) => `  - ${finding}`).join("\n") +
      `\n\n  Publica desde Cloudflare Workers Builds (push a main en GitHub), o mueve esos\n` +
      `  archivos fuera del proyecto mientras publicas.\n`,
  );
  process.exit(1);
}
