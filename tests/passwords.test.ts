import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/auth/passwords";

describe("Password Hashing & Verification Security", () => {
  test("hashes plain passwords using bcrypt salt rounds and verifies successfully", async () => {
    const rawPassword = "EverlightSecret2026!";
    const hash = await hashPassword(rawPassword);

    assert.notEqual(rawPassword, hash);
    assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"));

    const isMatch = await verifyPassword(rawPassword, hash);
    assert.equal(isMatch, true);
  });

  test("rejects incorrect passwords", async () => {
    const hash = await hashPassword("ValidPassword123!");
    const isMatch = await verifyPassword("WrongPassword123!", hash);
    assert.equal(isMatch, false);
  });

  test("rejects passwords shorter than 8 characters", async () => {
    await assert.rejects(
      async () => {
        await hashPassword("short");
      },
      /at least 8 characters/
    );
  });

  test("handles empty or missing password hashes safely without throwing", async () => {
    assert.equal(await verifyPassword("somepass", ""), false);
    assert.equal(await verifyPassword("somepass", undefined), false);
    assert.equal(await verifyPassword("", "somehash"), false);
  });
});
