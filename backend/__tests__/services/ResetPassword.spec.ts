import User from "../../src/models/User";
import ResetPassword from "../../src/services/ResetPasswordService/ResetPassword";

jest.mock("../../src/models/User", () => ({
  __esModule: true,
  default: { findOne: jest.fn() }
}));

const findOneMock = User.findOne as unknown as jest.Mock;

const fakeUser = (resetPassword: string) => ({
  resetPassword,
  update: jest.fn().mockResolvedValue(undefined)
});

describe("ResetPassword", () => {
  beforeEach(() => {
    findOneMock.mockReset();
  });

  it("redefine a senha quando o token confere", async () => {
    const user = fakeUser("token-valido");
    findOneMock.mockResolvedValue(user);

    const result = await ResetPassword(
      "user@example.com",
      "token-valido",
      "NovaSenha1"
    );

    expect(result).toBeUndefined();
    expect(user.update).toHaveBeenCalledWith({
      password: "NovaSenha1",
      resetPassword: ""
    });
  });

  it("rejeita token errado sem alterar a senha", async () => {
    const user = fakeUser("token-valido");
    findOneMock.mockResolvedValue(user);

    const result = await ResetPassword(
      "user@example.com",
      "token-errado",
      "NovaSenha1"
    );

    expect(result).toEqual({ status: 404, message: "Token não encontrado" });
    expect(user.update).not.toHaveBeenCalled();
  });

  it("rejeita quando o usuário não tem token de reset pendente", async () => {
    findOneMock.mockResolvedValue(null);

    const result = await ResetPassword(
      "user@example.com",
      "qualquer-token",
      "NovaSenha1"
    );

    expect(result).toEqual({ status: 404, message: "Token não encontrado" });
  });

  it("exige email, token e senha", async () => {
    const result = await ResetPassword("", "", "");

    expect(result).toEqual({ status: 400, message: "Dados incompletos" });
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("passa o email como valor parametrizado, sem interpolar em SQL", async () => {
    const user = fakeUser("token-valido");
    findOneMock.mockResolvedValue(user);

    const injection = "' OR 1=1 --";
    await ResetPassword(injection, "token-valido", "NovaSenha1");

    // O email deve chegar como valor no where, nunca concatenado em uma string SQL.
    const where = findOneMock.mock.calls[0][0].where;
    expect(where.email).toBe(injection);
  });

  it("não altera a senha quando o token é um payload de injeção", async () => {
    const user = fakeUser("token-valido");
    findOneMock.mockResolvedValue(user);

    const result = await ResetPassword(
      "user@example.com",
      "' OR \"resetPassword\" != '",
      "SenhaDoAtacante1"
    );

    expect(result).toEqual({ status: 404, message: "Token não encontrado" });
    expect(user.update).not.toHaveBeenCalled();
  });
});
