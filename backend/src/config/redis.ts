// Garante que a URI de conexão seja uma string.
export const REDIS_URI_CONNECTION = process.env.REDIS_URI || "";

// Converte o valor para um número inteiro, com um padrão de 1.
export const REDIS_OPT_LIMITER_MAX = parseInt(process.env.REDIS_OPT_LIMITER_MAX || "1", 10);

// Converte o valor para um número inteiro, com um padrão de 3000.
export const REDIS_OPT_LIMITER_DURATION = parseInt(process.env.REDIS_OPT_LIMITER_DURATION || "3000", 10);
