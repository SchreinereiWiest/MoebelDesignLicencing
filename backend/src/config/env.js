const required = name => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ist nicht konfiguriert`);
  return value;
};

const integer = (name, fallback) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} muss eine positive Ganzzahl sein`);
  return value;
};

export function loadEnvironment() {
  const production = process.env.NODE_ENV === "production";
  const adminPassword = required("ADMIN_PASSWORD");
  const clientKey = required("CARPENTERS_API_KEY");
  if (production && (
    adminPassword.length < 16
    || clientKey.length < 32
    || adminPassword.startsWith("CHANGE_ME")
    || clientKey.startsWith("CHANGE_ME")
  )) {
    throw new Error("Produktive Zugangsdaten müssen ersetzt werden; ADMIN_PASSWORD benötigt mindestens 16 und CARPENTERS_API_KEY mindestens 32 Zeichen");
  }

  return {
    production,
    port: integer("PORT", 5100),
    adminEmail: required("ADMIN_EMAIL").toLowerCase(),
    adminName: process.env.ADMIN_NAME?.trim() || "Lizenz-Administrator",
    adminPassword,
    clientName: process.env.CARPENTERS_CLIENT_NAME?.trim() || "CarpentersProduction",
    clientKey,
    sessionHours: integer("SESSION_TTL_HOURS", 12),
    allowedOrigins: new Set((process.env.ALLOWED_ORIGINS || "http://licensing.localhost").split(",").map(value => value.trim()).filter(Boolean))
  };
}
