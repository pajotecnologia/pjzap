const STRONG_A = "L8gQ2vN7pXsR4tYwZ1aB3cD5eF6gH9jK0mN2pQ4rS6t=";
const STRONG_B = "Z9yX8wV7uT6sR5qP4oN3mL2kJ1hG0fE9dC8bA7zY6x5=";

const loadAuthConfig = () => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  return require("../../src/config/auth").default;
};

describe("config/auth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("carrega os segredos válidos do ambiente", () => {
    process.env.JWT_SECRET = STRONG_A;
    process.env.JWT_REFRESH_SECRET = STRONG_B;

    const config = loadAuthConfig();

    expect(config.secret).toBe(STRONG_A);
    expect(config.refreshSecret).toBe(STRONG_B);
    expect(config.expiresIn).toBe("15m");
    expect(config.refreshExpiresIn).toBe("7d");
  });

  it("falha quando JWT_SECRET não está definido", () => {
    delete process.env.JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = STRONG_B;

    expect(loadAuthConfig).toThrow(/JWT_SECRET não está definido/);
  });

  it("falha quando JWT_REFRESH_SECRET não está definido", () => {
    process.env.JWT_SECRET = STRONG_A;
    delete process.env.JWT_REFRESH_SECRET;

    expect(loadAuthConfig).toThrow(/JWT_REFRESH_SECRET não está definido/);
  });

  it("rejeita os fallbacks fracos antigos do código", () => {
    process.env.JWT_SECRET = "mysecret";
    process.env.JWT_REFRESH_SECRET = "myanothersecret";

    expect(loadAuthConfig).toThrow(/valor público de exemplo/);
  });

  it("rejeita os segredos que vazaram no .env.example", () => {
    process.env.JWT_SECRET = "kZaOTd+YZpjRUyyuQUpigJaEMk4vcW4YOymKPZX0Ts8=";
    process.env.JWT_REFRESH_SECRET = STRONG_B;

    expect(loadAuthConfig).toThrow(/valor público de exemplo/);
  });

  it("rejeita segredo curto demais", () => {
    process.env.JWT_SECRET = "curto123";
    process.env.JWT_REFRESH_SECRET = STRONG_B;

    expect(loadAuthConfig).toThrow(/curto demais/);
  });
});
