import test from "node:test";
import assert from "node:assert/strict";
import { publicLicense } from "../src/modules/licenses/license.service.js";
import { features, optionalDate, optionalInteger, status } from "../src/shared/validation.js";
import { HttpError } from "../src/shared/http.js";

const record = {
  id: "internal-id",
  licenseId: "lic_test",
  products: ["carpenters-production", "moebel-design-suite"],
  tenantId: "tenant-id",
  companyName: "Beispiel GmbH",
  tenantSlug: "beispiel",
  plan: "professional",
  features: ["crm", "work-preparation"],
  maxUsers: 10,
  validUntil: null,
  status: "active",
  activationKeyHint: "12345678",
  lastValidatedAt: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z")
};

test("öffentliche Lizenzen enthalten keine Aktivierungsschlüssel-Hashes", () => {
  const result = publicLicense({ ...record, activationKeyHash: "secret-hash" });
  assert.equal(Object.hasOwn(result, "activationKeyHash"), false);
  assert.equal(result.activationKeyHint, "12345678");
  assert.deepEqual(result.products, ["carpenters-production", "moebel-design-suite"]);
});

test("abgelaufene aktive Lizenzen werden als expired ausgeliefert", () => {
  const result = publicLicense({ ...record, validUntil: new Date("2020-01-01T00:00:00.000Z") });
  assert.equal(result.status, "expired");
});

test("Lizenzfelder werden streng validiert", () => {
  assert.deepEqual(features(["crm", "crm", "work-preparation"]), ["crm", "work-preparation"]);
  assert.deepEqual(features(["public-content", "moodboards"]), ["public-content", "moodboards"]);
  assert.equal(optionalInteger("12", "Benutzerlimit"), 12);
  assert.equal(optionalDate("", "Ablaufdatum"), null);
  assert.equal(status("active"), "active");
  assert.throws(() => features(["unknown"]), error => error instanceof HttpError && error.status === 400);
  assert.throws(() => optionalInteger(0, "Benutzerlimit"), error => error instanceof HttpError);
  assert.throws(() => status("expired"), error => error instanceof HttpError);
});
