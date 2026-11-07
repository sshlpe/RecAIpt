/**
 * Corre antes de `dev` y `build` (predev / prebuild).
 * 1. Falla con un mensaje claro si Node es más viejo que `engines.node` de package.json
 *    (el error real de Tailwind con Node viejo es críptico: "require() of ES Module ...").
 * 2. Si la versión de Node cambió desde el último build, borra `.next`: Turbopack guarda
 *    en cache el Node con que se compiló y sigue fallando aunque ya cambiaste de versión.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const BUILD_DIR = ".next";
// Fuera de .next porque `next build` vacía esa carpeta.
const NODE_VERSION_MARKER = "node_modules/.cache/recaipt/node-version";

function parseVersion(version) {
  return version
    .replace(/^[^\d]*/, "")
    .split(".")
    .map(Number);
}

function isAtLeast(current, minimum) {
  for (let index = 0; index < minimum.length; index++) {
    if ((current[index] ?? 0) !== minimum[index]) return (current[index] ?? 0) > minimum[index];
  }
  return true;
}

function assertSupportedNodeVersion() {
  const { engines } = JSON.parse(readFileSync("package.json", "utf8"));
  const minimumVersion = engines.node.replace(">=", "");
  if (isAtLeast(parseVersion(process.version), parseVersion(minimumVersion))) return;
  console.error(
    `\n✖ Este proyecto necesita Node ${minimumVersion} o superior y estás usando ${process.version}.\n` +
      `  Abre una terminal nueva (o ejecuta "source ~/.zshrc") dentro del proyecto para que fnm\n` +
      `  active la versión del .nvmrc, y verifica con "node -v".\n`,
  );
  process.exit(1);
}

function clearBuildCacheIfNodeChanged() {
  const previousVersion = existsSync(NODE_VERSION_MARKER)
    ? readFileSync(NODE_VERSION_MARKER, "utf8").trim()
    : null;
  if (existsSync(BUILD_DIR) && previousVersion !== process.version) {
    console.log(
      `Node cambió (${previousVersion ?? "desconocido"} → ${process.version}): limpiando ${BUILD_DIR}/`,
    );
    rmSync(BUILD_DIR, { recursive: true, force: true });
  }
}

function recordNodeVersion() {
  mkdirSync(dirname(NODE_VERSION_MARKER), { recursive: true });
  writeFileSync(NODE_VERSION_MARKER, process.version);
}

assertSupportedNodeVersion();
clearBuildCacheIfNodeChanged();
recordNodeVersion();
