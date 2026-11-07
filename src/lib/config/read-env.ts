/** Falta configuración del servidor (no es culpa del usuario ni del modelo). */
export class MissingConfigError extends Error {
  constructor(variableName: string) {
    super(`Falta la variable de entorno ${variableName}. Revisa .env.local (ver .env.example).`);
    this.name = "MissingConfigError";
  }
}

export function readRequiredEnv(variableName: string): string {
  const value = process.env[variableName]?.trim();
  if (!value) throw new MissingConfigError(variableName);
  return value;
}

export function readOptionalEnv(variableName: string, defaultValue: string): string {
  return process.env[variableName]?.trim() || defaultValue;
}
