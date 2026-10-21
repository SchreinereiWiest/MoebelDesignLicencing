import { HttpError } from "./http.js";

export const LICENSE_FEATURES = ["crm", "cabinet", "nesting", "management", "storage", "time", "purchasing"];
export const LICENSE_STATUSES = ["active", "inactive", "suspended", "revoked"];

export const text = (value, field, { required = true, max = 200 } = {}) => {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new HttpError(400, "VALIDATION_ERROR", `${field} ist erforderlich`);
  if (result.length > max) throw new HttpError(400, "VALIDATION_ERROR", `${field} ist zu lang`);
  return result || null;
};

export const optionalInteger = (value, field) => {
  if (value === "" || value == null) return null;
  const result = Number(value);
  if (!Number.isInteger(result) || result < 1) throw new HttpError(400, "VALIDATION_ERROR", `${field} muss eine positive Ganzzahl sein`);
  return result;
};

export const optionalDate = (value, field) => {
  if (!value) return null;
  const result = new Date(value);
  if (Number.isNaN(result.getTime())) throw new HttpError(400, "VALIDATION_ERROR", `${field} ist ungültig`);
  return result;
};

export const features = value => {
  if (!Array.isArray(value) || value.some(item => !LICENSE_FEATURES.includes(item))) {
    throw new HttpError(400, "VALIDATION_ERROR", "features enthält unbekannte Module");
  }
  return [...new Set(value)];
};

export const status = value => {
  if (!LICENSE_STATUSES.includes(value)) throw new HttpError(400, "VALIDATION_ERROR", "status ist ungültig");
  return value;
};

export const normalizedName = value => String(value).trim().toLocaleLowerCase("de-DE");
