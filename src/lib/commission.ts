export interface CommissionPolicy {
  ratePercentage: number;
  payerRole: "landlord" | "tenant";
  dueDays: number;
  minimumAmountETB: number;
}

export function getCommissionPolicy(): CommissionPolicy {
  const rate = Number(process.env.COMMISSION_PERCENTAGE) || 50;
  const payer = (process.env.COMMISSION_PAYER as "landlord" | "tenant") || "tenant";
  const dueDays = Number(process.env.COMMISSION_DUE_DAYS) || 7;

  return {
    ratePercentage: Math.max(1, Math.min(100, rate)),
    payerRole: payer,
    dueDays: Math.max(1, dueDays),
    minimumAmountETB: 200,
  };
}

export function calculateCommission(agreedMonthlyRent: number, customRate?: number) {
  if (agreedMonthlyRent <= 0 || !Number.isFinite(agreedMonthlyRent)) {
    throw new Error("Agreed monthly rent must be a positive finite number");
  }

  const policy = getCommissionPolicy();
  const rate = customRate !== undefined ? customRate : policy.ratePercentage;
  const calculated = Math.round((agreedMonthlyRent * rate) / 100);
  const amount = Math.max(calculated, policy.minimumAmountETB);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + policy.dueDays);

  return {
    ratePercentage: rate,
    amountETB: amount,
    payerRole: policy.payerRole,
    basis: `Tenant brokerage commission agreed upon property selection and lease confirmation (ETB ${amount.toLocaleString()})`,
    dueDate,
  };
}
