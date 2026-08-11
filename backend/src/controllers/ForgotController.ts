import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import SendMail from "../services/ForgotPassWordServices/SendMail";
import ResetPassword from "../services/ResetPasswordService/ResetPassword";

type ForgotBody = { email?: string };
type ResetBody = { email?: string; token?: string; password?: string };

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body as ForgotBody;

  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório" });
  }

  const TokenSenha = uuid();
  await SendMail(email, TokenSenha);

  // Resposta genérica de propósito: não revela se o e-mail existe na base.
  return res
    .status(200)
    .json({ message: "Se o e-mail existir, você receberá as instruções" });
};

export const resetPasswords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, token, password } = req.body as ResetBody;

  if (!email || !token || !password) {
    return res
      .status(400)
      .json({ error: "E-mail, token e senha são obrigatórios" });
  }

  const result = await ResetPassword(email, token, password);

  if (result) {
    return res
      .status(result.status)
      .json({ error: result.message || "Verifique o Token informado" });
  }

  return res.status(200).json({ message: "Senha redefinida com sucesso" });
};
