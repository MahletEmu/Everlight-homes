import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateCommission, getCommissionPolicy } from "../src/lib/commission";

describe("Commission Calculation Engine", () => {
  test("calculates standard 50% commission correctly for Ethiopian Birr rental", () => {
    const monthlyRent = 80000; // 80,000 ETB
    const result = calculateCommission(monthlyRent, 50);

    assert.equal(result.ratePercentage, 50);
    assert.equal(result.amountETB, 40000);
    assert.equal(result.payerRole, "tenant");
    assert.ok(result.dueDate instanceof Date);
    assert.ok(result.basis.includes("Tenant brokerage commission"));
  });

  test("enforces minimum commission amount for very small rentals", () => {
    const policy = getCommissionPolicy();
    const result = calculateCommission(250, 10); // 10% of 250 is 25, below min 200 ETB
    assert.equal(result.amountETB, policy.minimumAmountETB);
  });

  test("rejects non-positive or non-finite rent values", () => {
    assert.throws(() => calculateCommission(0), /must be a positive finite number/);
    assert.throws(() => calculateCommission(-5000), /must be a positive finite number/);
    assert.throws(() => calculateCommission(NaN), /must be a positive finite number/);
  });

  test("due date is strictly set in the future according to policy days", () => {
    const before = new Date();
    const result = calculateCommission(50000);
    assert.ok(result.dueDate.getTime() > before.getTime());
  });
});
