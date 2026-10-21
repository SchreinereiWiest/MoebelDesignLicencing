import { prisma } from "../../lib/prisma.js";
import { hashToken, randomToken, verifyPassword } from "../../shared/crypto.js";
import { HttpError } from "../../shared/http.js";
import { clearLoginAttempts } from "../../middleware/login-rate-limit.js";

const publicAdmin = admin => ({
  id: admin.id,
  email: admin.email,
  displayName: admin.displayName
});

export function createAuthController(environment) {
  const cookieBase = {
    httpOnly: true,
    secure: environment.production,
    sameSite: "strict",
    path: "/"
  };

  return {
    login: async (req, res) => {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!email || !password) throw new HttpError(400, "VALIDATION_ERROR", "E-Mail und Passwort sind erforderlich");

      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin?.isActive || !await verifyPassword(password, admin.passwordHash)) {
        throw new HttpError(401, "INVALID_CREDENTIALS", "E-Mail oder Passwort ist ungültig");
      }

      const sessionToken = randomToken(48);
      const csrfToken = randomToken(32);
      const expiresAt = new Date(Date.now() + environment.sessionHours * 60 * 60 * 1000);
      await prisma.$transaction([
        prisma.adminSession.create({
          data: {
            adminId: admin.id,
            tokenHash: hashToken(sessionToken),
            csrfTokenHash: hashToken(csrfToken),
            expiresAt
          }
        }),
        prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
      ]);

      clearLoginAttempts(req);
      res.cookie("licensing_session", sessionToken, { ...cookieBase, maxAge: environment.sessionHours * 60 * 60 * 1000 });
      res.cookie("XSRF-TOKEN", csrfToken, {
        secure: environment.production,
        sameSite: "strict",
        path: "/",
        maxAge: environment.sessionHours * 60 * 60 * 1000
      });
      res.json({ admin: publicAdmin(admin), expiresAt });
    },

    me: async (req, res) => {
      res.json({ admin: publicAdmin(req.admin), expiresAt: req.adminSession.expiresAt });
    },

    logout: async (req, res) => {
      await prisma.adminSession.delete({ where: { id: req.adminSession.id } });
      res.clearCookie("licensing_session", cookieBase);
      res.clearCookie("XSRF-TOKEN", { secure: environment.production, sameSite: "strict", path: "/" });
      res.status(204).end();
    }
  };
}
