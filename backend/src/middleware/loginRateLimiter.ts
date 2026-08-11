import rateLimit from "express-rate-limit";

const skipLocal = (req: any): boolean =>
  req.method === "OPTIONS" || req.ip === "127.0.0.1" || req.ip === "::1";

/**
 * Limite estreito para endpoints que aceitam credenciais. O limitador geral de
 * /auth (500 req/15min) é frouxo demais para brute force de senha.
 * Conta por IP + e-mail para que um atacante não consuma a cota de um usuário
 * legítimo atrás do mesmo NAT.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req): string => {
    const email = String(req.body?.email || "").toLowerCase();
    return `${req.ip}:${email}`;
  },
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos."
  },
  skip: skipLocal
});

/**
 * Recuperação de senha: envia e-mail e grava token, então limitamos por IP para
 * evitar enumeração de contas e flood de mensagens.
 */
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas solicitações de recuperação. Tente novamente mais tarde."
  },
  skip: skipLocal
});
