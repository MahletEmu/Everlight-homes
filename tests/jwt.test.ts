import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { signSessionToken, verifySessionToken, SessionPayload } from "../src/lib/auth/jwt";

describe("JWT Session Tokens", () => {
  const sampleUser: SessionPayload = {
    userId: "64e0f1a2b3c4d5e6f7a8b9c0",
    email: "tenant@everlight.et",
    name: "Yonas Mekonnen",
    role: "tenant",
    isVerified: true,
  };

  test("signs and verifies session token preserving identity and role", async () => {
    const token = await signSessionToken(sampleUser);
    assert.ok(typeof token === "string");
    assert.ok(token.split(".").length === 3);

    const verified = await verifySessionToken(token);
    assert.ok(verified !== null);
    assert.equal(verified?.userId, sampleUser.userId);
    assert.equal(verified?.email, sampleUser.email);
    assert.equal(verified?.role, sampleUser.role);
    assert.equal(verified?.isVerified, true);
  });

  test("rejects tampered or forged tokens", async () => {
    const validToken = await signSessionToken(sampleUser);
    const tamperedToken = validToken.slice(0, -6) + "xyz123";

    const verified = await verifySessionToken(tamperedToken);
    assert.equal(verified, null);
  });

  test("returns null for empty token strings", async () => {
    assert.equal(await verifySessionToken(""), null);
  });
});
