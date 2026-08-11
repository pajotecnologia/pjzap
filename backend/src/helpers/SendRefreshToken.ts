import { Response } from "express";

// Deve acompanhar refreshExpiresIn em config/auth.ts (7 dias).
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  // Sem HTTPS o cookie não pode ser Secure, senão o navegador o descarta em dev.
  secure:
    process.env.NODE_ENV === "production" ||
    (process.env.BACKEND_URL || "").startsWith("https://"),
  sameSite: "lax" as const,
  path: "/"
});

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, {
    ...cookieOptions(),
    maxAge: REFRESH_TOKEN_MAX_AGE
  });
};

export const clearRefreshToken = (res: Response): void => {
  res.clearCookie("jrt", cookieOptions());
};
