import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { prisma } from "./lib/prisma.js";
import { errorHandler, HttpError } from "./shared/http.js";
import { createAuthRoutes } from "./modules/auth/auth.routes.js";
import { adminLicenseRoutes, clientLicenseRoutes } from "./modules/licenses/license.routes.js";

export function createApp(environment) {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || environment.allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    }
  }));
  app.use(express.json({ limit: "128kb" }));
  app.use(cookieParser());

  app.get("/api/health", async (_req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok", database: "connected" });
    } catch (error) {
      next(error);
    }
  });
  app.use("/api/auth", createAuthRoutes(environment));
  app.use("/api/admin/licenses", adminLicenseRoutes);
  app.use("/api/v1/licenses", clientLicenseRoutes);

  app.use((_req, _res, next) => next(new HttpError(404, "NOT_FOUND", "Route nicht gefunden")));
  app.use(errorHandler);
  return app;
}
