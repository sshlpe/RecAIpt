import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Configuración mínima: la app no usa ISR ni caché de datos (una página estática y una ruta
 * de API), así que no necesita bucket R2 ni caché incremental.
 */
export default defineCloudflareConfig();
