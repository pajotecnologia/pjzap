import { Op } from "sequelize";
import { timingSafeEqual } from "crypto";
import User from "../../models/User";

const safeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

const ResetPassword = async (
  email: string,
  token: string,
  password: string
) => {
  if (!email || !token || !password) {
    return { status: 400, message: "Dados incompletos" };
  }

  const user = await User.findOne({
    where: {
      email,
      resetPassword: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] }
    }
  });

  if (!user || !user.resetPassword) {
    return { status: 404, message: "Token não encontrado" };
  }

  if (!safeCompare(user.resetPassword, token)) {
    return { status: 404, message: "Token não encontrado" };
  }

  // O hook BeforeUpdate do modelo faz o hash de `password` (campo VIRTUAL).
  await user.update({ password, resetPassword: "" });

  return undefined;
};

export default ResetPassword;
