import { HttpError } from "../shared/http.js";

const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function loginRateLimit(req, _res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return next(new HttpError(429, "LOGIN_RATE_LIMIT", "Zu viele Anmeldeversuche. Bitte später erneut versuchen."));
  }
  next();
}

export function clearLoginAttempts(req) {
  attempts.delete(req.ip || "unknown");
}
