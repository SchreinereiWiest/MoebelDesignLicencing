import test from "node:test";
import assert from "node:assert/strict";
import { constantTimeEqual, hashPassword, hashToken, randomToken, verifyPassword } from "../src/shared/crypto.js";

test("Passwörter werden mit Salt gehasht und korrekt geprüft", async () => {
  const first = await hashPassword("a-strong-test-password");
  const second = await hashPassword("a-strong-test-password");

  assert.notEqual(first, second);
  assert.equal(await verifyPassword("a-strong-test-password", first), true);
  assert.equal(await verifyPassword("wrong-password", first), false);
});

test("API- und Sitzungstoken sind zufällig und werden nur als Hash verglichen", () => {
  const token = randomToken(32);
  assert.notEqual(token, randomToken(32));
  assert.equal(hashToken(token), hashToken(token));
  assert.equal(constantTimeEqual(hashToken(token), hashToken(token)), true);
  assert.equal(constantTimeEqual(hashToken(token), hashToken("other")), false);
});
