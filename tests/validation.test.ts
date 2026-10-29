import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  RegisterSchema,
  LoginSchema,
  PropertySchema,
  InquirySchema,
  AgreementSchema,
  CommissionReconcileSchema,
  DisputeSchema,
  VerificationUpdateSchema,
} from "../src/lib/validation";

describe("Zod Validation Schemas", () => {
  describe("Registration Validation & Anti-Privilege Escalation", () => {
    test("accepts valid tenant registration data", () => {
      const valid = RegisterSchema.safeParse({
        name: "Abebe Bikila",
        email: "abebe@example.com",
        password: "ValidPassword123!",
        role: "tenant",
        phone: "+251911223344",
      });
      assert.equal(valid.success, true);
    });

    test("accepts valid landlord registration data", () => {
      const valid = RegisterSchema.safeParse({
        name: "Bethlehem Tilahun",
        email: "beth@example.com",
        password: "ValidPassword123!",
        role: "landlord",
      });
      assert.equal(valid.success, true);
    });

    test("strictly rejects self-assigned admin role", () => {
      const invalid = RegisterSchema.safeParse({
        name: "Attacker",
        email: "attacker@example.com",
        password: "ValidPassword123!",
        role: "admin", // Admin cannot be chosen via registration
      });
      assert.equal(invalid.success, false);
    });

    test("rejects passwords lacking numbers or uppercase letters", () => {
      const noUpper = RegisterSchema.safeParse({
        name: "Test User",
        email: "user@example.com",
        password: "password123!",
        role: "tenant",
      });
      assert.equal(noUpper.success, false);

      const noNumber = RegisterSchema.safeParse({
        name: "Test User",
        email: "user@example.com",
        password: "PasswordWithoutNumber!",
        role: "tenant",
      });
      assert.equal(noNumber.success, false);
    });
  });

  describe("Login Validation", () => {
    test("accepts valid login credentials", () => {
      const valid = LoginSchema.safeParse({
        email: "tenant@everlight.et",
        password: "SecurePassword123!",
      });
      assert.equal(valid.success, true);
    });

    test("rejects malformed email address", () => {
      const invalid = LoginSchema.safeParse({
        email: "not-an-email",
        password: "SecurePassword123!",
      });
      assert.equal(invalid.success, false);
    });

    test("rejects empty password", () => {
      const invalid = LoginSchema.safeParse({
        email: "tenant@everlight.et",
        password: "",
      });
      assert.equal(invalid.success, false);
    });
  });

  describe("Property Validation", () => {
    test("rejects property with monthly rent below 500 ETB", () => {
      const res = PropertySchema.safeParse({
        title: "Nice Villa in Bahir Dar",
        description: "Spacious house with garden and backup power in Kebele 01 Lake Tana.",
        propertyType: "house",
        monthlyRent: 200, // Below minimum 500
        city: "Bahir Dar",
        neighborhood: "Kebele 01 (Lake Tana Shore / ጣና ሐይቅ)",
        bedrooms: 2,
        bathrooms: 2,
        sizeM2: 120,
        images: [{ url: "https://example.com/p1.jpg" }],
      });
      assert.equal(res.success, false);
    });

    test("rejects property without photographs", () => {
      const res = PropertySchema.safeParse({
        title: "Nice Villa in Bahir Dar",
        description: "Spacious house with garden and backup power in Kebele 01 Lake Tana.",
        propertyType: "house",
        monthlyRent: 50000,
        city: "Bahir Dar",
        neighborhood: "Kebele 01 (Lake Tana Shore / ጣና ሐይቅ)",
        bedrooms: 2,
        bathrooms: 2,
        sizeM2: 120,
        images: [], // Missing photos
      });
      assert.equal(res.success, false);
    });
  });

  describe("Inquiry Validation", () => {
    test("accepts valid rental inquiry with message and viewing date", () => {
      const valid = InquirySchema.safeParse({
        propertyId: "prop_12345",
        message: "Hello, I am interested in viewing this property this Saturday afternoon.",
        requestedViewingDate: "2026-11-01",
      });
      assert.equal(valid.success, true);
    });

    test("rejects inquiry message shorter than 10 characters", () => {
      const invalid = InquirySchema.safeParse({
        propertyId: "prop_12345",
        message: "Hi", // Too short
      });
      assert.equal(invalid.success, false);
    });

    test("rejects inquiry missing propertyId", () => {
      const invalid = InquirySchema.safeParse({
        propertyId: "",
        message: "Hello, I am interested in scheduling a home visit.",
      });
      assert.equal(invalid.success, false);
    });
  });

  describe("Agreement Proposal Validation", () => {
    test("accepts valid mutual rental agreement parameters", () => {
      const valid = AgreementSchema.safeParse({
        propertyId: "prop_12345",
        tenantId: "tenant_67890",
        agreedRent: 35000,
        deposit: 70000,
        startDate: "2026-11-01",
        durationMonths: 12,
      });
      assert.equal(valid.success, true);
    });

    test("rejects agreed rent below minimum 500 ETB", () => {
      const invalid = AgreementSchema.safeParse({
        propertyId: "prop_12345",
        tenantId: "tenant_67890",
        agreedRent: 100, // Below minimum
        startDate: "2026-11-01",
      });
      assert.equal(invalid.success, false);
    });

    test("rejects durationMonths out of 1-60 bounds", () => {
      const invalid = AgreementSchema.safeParse({
        propertyId: "prop_12345",
        tenantId: "tenant_67890",
        agreedRent: 35000,
        startDate: "2026-11-01",
        durationMonths: 72, // Exceeds 60
      });
      assert.equal(invalid.success, false);
    });
  });

  describe("Commission Reconciliation Validation", () => {
    test("validates official transaction reference", () => {
      const valid = CommissionReconcileSchema.safeParse({
        paymentStatus: "paid",
        paymentReference: "CBE-FT241027981",
        paymentMethod: "bank_transfer",
        reconciledNotes: "Confirmed on CBE portal statement.",
      });
      assert.equal(valid.success, true);
    });

    test("rejects empty payment transaction reference", () => {
      const invalid = CommissionReconcileSchema.safeParse({
        paymentStatus: "paid",
        paymentReference: "",
        paymentMethod: "bank_transfer",
      });
      assert.equal(invalid.success, false);
    });
  });

  describe("Dispute Report Validation", () => {
    test("accepts valid dispute filing with sufficient detail", () => {
      const valid = DisputeSchema.safeParse({
        targetType: "property",
        targetId: "prop_12345",
        reason: "Misleading property information",
        description: "The listing states backup generator included, but landlord confirmed on site none exists.",
      });
      assert.equal(valid.success, true);
    });

    test("rejects dispute with description under 15 characters", () => {
      const invalid = DisputeSchema.safeParse({
        targetType: "landlord",
        targetId: "user_landlord_1",
        reason: "Unresponsive",
        description: "Not answering", // Too short
      });
      assert.equal(invalid.success, false);
    });
  });

  describe("Verification Moderation Validation", () => {
    test("accepts valid verification update payload", () => {
      const valid = VerificationUpdateSchema.safeParse({
        ownerVerificationStatus: "verified",
        physicalInspectionStatus: "inspected",
        inspectionDate: "2026-10-28",
        inspectorName: "Mimi Field Auditor",
        notes: "Kebele residence book and title deed physically confirmed on site.",
      });
      assert.equal(valid.success, true);
    });

    test("rejects unrecognized status values", () => {
      const invalid = VerificationUpdateSchema.safeParse({
        ownerVerificationStatus: "unknown_status",
        physicalInspectionStatus: "inspected",
      });
      assert.equal(invalid.success, false);
    });
  });
});
