import express from "express";
import { authenticateAdmin, authenticateApiClient, requireCsrf } from "../../middleware/auth.js";
import { asyncRoute, HttpError } from "../../shared/http.js";
import * as controller from "./license.controller.js";

export const adminLicenseRoutes = express.Router();
adminLicenseRoutes.use(authenticateAdmin);
adminLicenseRoutes.get("/", asyncRoute(controller.list));
adminLicenseRoutes.post("/", requireCsrf, asyncRoute(controller.create));
adminLicenseRoutes.patch("/:id", requireCsrf, asyncRoute(controller.update));
adminLicenseRoutes.delete("/:id", requireCsrf, asyncRoute(controller.remove));
adminLicenseRoutes.post("/:id/rotate-key", requireCsrf, asyncRoute(controller.rotateKey));

export const clientLicenseRoutes = express.Router();
clientLicenseRoutes.use((req, _res, next) => {
  if (req.get("x-license-api-version") !== "1") {
    return next(new HttpError(400, "API_VERSION_UNSUPPORTED", "X-License-Api-Version 1 ist erforderlich"));
  }
  next();
});
clientLicenseRoutes.use(authenticateApiClient);
clientLicenseRoutes.post("/validate", asyncRoute(controller.validate));
clientLicenseRoutes.post("/activate", asyncRoute(controller.activate));
