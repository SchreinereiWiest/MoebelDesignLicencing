import { prisma } from "../lib/prisma.js";
import { constantTimeEqual, hashToken } from "../shared/crypto.js";
import { HttpError } from "../shared/http.js";

export async function authenticateAdmin(req, _res, next) {
  try {
    const token = req.cookies?.licensing_session;
    if (!token)
      throw new HttpError(401, "NOT_AUTHENTICATED", "Anmeldung erforderlich");

    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { admin: true }
    });
    if (
      !session ||
      session.expiresAt <= new Date() ||
      !session.admin.isActive
    ) {
      if (session)
        await prisma.adminSession.delete({ where: { id: session.id } });
      throw new HttpError(401, "SESSION_INVALID", "Die Sitzung ist abgelaufen");
    }

    req.admin = session.admin;
    req.adminSession = session;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireCsrf(req, _res, next) {
  const cookieToken = req.cookies?.["XSRF-TOKEN"];
  const headerToken = req.get("x-xsrf-token");
  if (
    !cookieToken ||
    !headerToken ||
    !constantTimeEqual(cookieToken, headerToken) ||
    !constantTimeEqual(hashToken(headerToken), req.adminSession.csrfTokenHash)
  ) {
    return next(new HttpError(403, "CSRF_INVALID", "Ungültiger CSRF-Token"));
  }
  next();
}

export async function authenticateApiClient(req, _res, next) {
  try {
    const authorization = req.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match)
      throw new HttpError(
        401,
        "API_AUTHENTICATION_REQUIRED",
        "API-Anmeldung erforderlich"
      );

    const apiClient = await prisma.apiClient.findUnique({
      where: { tokenHash: hashToken(match[1]) }
    });
    if (!apiClient?.isActive)
      throw new HttpError(
        403,
        "API_CLIENT_INACTIVE",
        "API-Client ist nicht freigeschaltet"
      );

    req.apiClient = apiClient;
    await prisma.apiClient.update({
      where: { id: apiClient.id },
      data: { lastUsedAt: new Date() }
    });
    next();
  } catch (error) {
    next(error);
  }
}
