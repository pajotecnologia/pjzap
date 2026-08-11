import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import "reflect-metadata";
import "./bootstrap";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";

import bodyParser from 'body-parser';
import uploadConfig from "./config/upload";
import "./database";
import AppError from "./errors/AppError";
import { messageQueue, sendScheduledMessages } from "./queues";
import routes from "./routes";
import { logger } from "./utils/logger";
import { getAllowedOrigins, isOriginAllowed } from "./helpers/CorsOrigins";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

const allowedOrigins = getAllowedOrigins();

if (allowedOrigins.length === 0) {
  logger.warn(
    "FRONTEND_URL/CORS_ALLOWED_ORIGINS não configurado: requisições cross-origin do navegador serão bloqueadas."
  );
}

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }
      logger.warn(`CORS bloqueado para a origem: ${origin}`);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
  })
);

// "trust proxy: true" aceitaria qualquer X-Forwarded-For, permitindo forjar o IP e
// burlar o rate limit. Confiamos apenas no número de proxies à frente da app
// (nginx local = 1). Ajuste TRUST_PROXY_HOPS se houver CDN/load balancer extra.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 1);
app.set("trust proxy", Number.isInteger(trustProxyHops) ? trustProxyHops : 1);

app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

app.use(bodyParser.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Este processo serve API JSON e os arquivos de /public (mídia de tickets), nunca
  // a SPA. A política proíbe execução de script, então um HTML/SVG malicioso salvo
  // em /public não roda no contexto do backend.
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      imgSrc: ["'self'", "data:", "blob:"],
      mediaSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'none'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"]
    }
  }
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições deste IP, tente novamente após 15 minutos',
  skip: (req) => {
    return req.method === 'OPTIONS' || req.ip === '127.0.0.1' || req.ip === '::1';
  }
});

app.use('/auth', apiLimiter);

app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
