const normalize = (origin: string): string => origin.trim().replace(/\/$/, "");

/**
 * Origens liberadas para requisições com credenciais. Aceita lista separada por
 * vírgula em CORS_ALLOWED_ORIGINS; por padrão usa apenas FRONTEND_URL.
 */
export const getAllowedOrigins = (): string[] =>
  (process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL || "")
    .split(",")
    .map(normalize)
    .filter(origin => origin.length > 0);

export const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigins: string[]
): boolean => {
  // Sem Origin = same-origin, curl ou webhook server-to-server.
  if (!origin) return true;
  return allowedOrigins.includes(normalize(origin));
};
