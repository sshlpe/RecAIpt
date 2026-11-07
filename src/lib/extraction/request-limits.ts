/**
 * Límites compartidos por todos los proveedores. Peor caso: MAX_ATTEMPTS × REQUEST_TIMEOUT_MS
 * + espera entre intentos, que debe quedar bajo `maxDuration` de la ruta (90 s).
 * Una foto real del teléfono tarda bastante más que una boleta de prueba nítida.
 * Sin esto, el SDK de Gemini reintenta hasta 5 veces con esperas de 60 s (≈4 min colgado).
 */
export const REQUEST_TIMEOUT_MS = 40_000;
export const MAX_ATTEMPTS = 2;
export const MAX_RETRY_DELAY_SECONDS = 2;
