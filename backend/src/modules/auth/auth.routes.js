import express from "express";
import { asyncRoute } from "../../shared/http.js";
import { authenticateAdmin, requireCsrf } from "../../middleware/auth.js";
import { loginRateLimit } from "../../middleware/login-rate-limit.js";
import { createAuthController } from "./auth.controller.js";

export function createAuthRoutes(environment) {
  const router = express.Router();
  const controller = createAuthController(environment);

  router.post("/login", loginRateLimit, asyncRoute(controller.login));
  router.get("/me", authenticateAdmin, asyncRoute(controller.me));
  router.post("/logout", authenticateAdmin, requireCsrf, asyncRoute(controller.logout));
  return router;
}
