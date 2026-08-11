import {
  getAllowedOrigins,
  isOriginAllowed
} from "../../src/helpers/CorsOrigins";

describe("CorsOrigins", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CORS_ALLOWED_ORIGINS;
    delete process.env.FRONTEND_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getAllowedOrigins", () => {
    it("usa FRONTEND_URL quando CORS_ALLOWED_ORIGINS não está definido", () => {
      process.env.FRONTEND_URL = "https://app.exemplo.com";

      expect(getAllowedOrigins()).toEqual(["https://app.exemplo.com"]);
    });

    it("aceita lista separada por vírgula e ignora espaços", () => {
      process.env.CORS_ALLOWED_ORIGINS =
        "https://app.exemplo.com, https://admin.exemplo.com";

      expect(getAllowedOrigins()).toEqual([
        "https://app.exemplo.com",
        "https://admin.exemplo.com"
      ]);
    });

    it("remove a barra final para comparar de forma consistente", () => {
      process.env.CORS_ALLOWED_ORIGINS = "https://app.exemplo.com/";

      expect(getAllowedOrigins()).toEqual(["https://app.exemplo.com"]);
    });

    it("CORS_ALLOWED_ORIGINS tem precedência sobre FRONTEND_URL", () => {
      process.env.FRONTEND_URL = "https://antigo.exemplo.com";
      process.env.CORS_ALLOWED_ORIGINS = "https://novo.exemplo.com";

      expect(getAllowedOrigins()).toEqual(["https://novo.exemplo.com"]);
    });

    it("retorna lista vazia quando nada está configurado", () => {
      expect(getAllowedOrigins()).toEqual([]);
    });
  });

  describe("isOriginAllowed", () => {
    const allowed = ["https://app.exemplo.com"];

    it("libera origem da allowlist", () => {
      expect(isOriginAllowed("https://app.exemplo.com", allowed)).toBe(true);
    });

    it("bloqueia origem de terceiro (o furo do origin: true)", () => {
      expect(isOriginAllowed("https://site-malicioso.com", allowed)).toBe(false);
    });

    it("bloqueia subdomínio parecido", () => {
      expect(
        isOriginAllowed("https://app.exemplo.com.malicioso.com", allowed)
      ).toBe(false);
    });

    it("diferencia http de https", () => {
      expect(isOriginAllowed("http://app.exemplo.com", allowed)).toBe(false);
    });

    it("libera requisição sem Origin (webhook server-to-server, curl)", () => {
      expect(isOriginAllowed(undefined, allowed)).toBe(true);
    });

    it("bloqueia qualquer origem quando a allowlist está vazia", () => {
      expect(isOriginAllowed("https://app.exemplo.com", [])).toBe(false);
    });
  });
});
