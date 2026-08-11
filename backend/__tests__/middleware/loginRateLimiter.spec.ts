import express from "express";
import request from "supertest";

import {
  loginRateLimiter,
  forgotPasswordRateLimiter
} from "../../src/middleware/loginRateLimiter";

// O app real arrasta banco/Redis; aqui só exercitamos os middlewares isolados.
const buildApp = (middleware: express.RequestHandler) => {
  const app = express();
  // Mesmo valor do app real: confia em 1 hop (nginx), não em qualquer XFF.
  app.set("trust proxy", 1);
  app.use(express.json());
  app.post("/login", middleware, (req, res) => {
    if (req.body.password === "certa") {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ error: "invalid" });
  });
  return app;
};

const post = (app: express.Express, body: object, ip = "203.0.113.10") =>
  request(app).post("/login").set("X-Forwarded-For", ip).send(body);

describe("loginRateLimiter", () => {
  it("bloqueia após 10 tentativas falhas do mesmo IP e e-mail", async () => {
    const app = buildApp(loginRateLimiter);
    const body = { email: "vitima@example.com", password: "errada" };

    for (let i = 0; i < 10; i += 1) {
      const res = await post(app, body);
      expect(res.status).toBe(401);
    }

    const blocked = await post(app, body);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/Muitas tentativas/);
  });

  it("não consome a cota de outro e-mail no mesmo IP", async () => {
    const app = buildApp(loginRateLimiter);

    for (let i = 0; i < 10; i += 1) {
      await post(app, { email: "alvo@example.com", password: "errada" });
    }

    const outro = await post(app, {
      email: "outro@example.com",
      password: "errada"
    });
    expect(outro.status).toBe(401);
  });

  it("logins bem-sucedidos não contam para o limite", async () => {
    const app = buildApp(loginRateLimiter);
    const body = { email: "ok@example.com", password: "certa" };

    for (let i = 0; i < 12; i += 1) {
      const res = await post(app, body);
      expect(res.status).toBe(200);
    }
  });

  it("trata e-mail com caixa diferente como a mesma chave", async () => {
    const app = buildApp(loginRateLimiter);

    for (let i = 0; i < 10; i += 1) {
      await post(app, { email: "Caixa@Example.com", password: "errada" });
    }

    const blocked = await post(app, {
      email: "caixa@example.com",
      password: "errada"
    });
    expect(blocked.status).toBe(429);
  });
});

describe("forgotPasswordRateLimiter", () => {
  it("bloqueia após 5 solicitações do mesmo IP", async () => {
    const app = buildApp(forgotPasswordRateLimiter);
    const body = { email: "alvo@example.com", password: "certa" };

    for (let i = 0; i < 5; i += 1) {
      const res = await post(app, body);
      expect(res.status).toBe(200);
    }

    const blocked = await post(app, body);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/Muitas solicitações/);
  });
});
