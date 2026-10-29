import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["tenant", "landlord"], {
    message: "Role must be either tenant or landlord",
  }),
  phone: z.string().optional().default(""),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const PropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(140),
  description: z.string().min(20, "Description must be at least 20 characters"),
  propertyType: z.enum([
    "apartment",
    "house",
    "condo",
    "private_room",
    "shared",
    "commercial",
  ]),
  monthlyRent: z.number().min(500, "Monthly rent must be at least 500 ETB"),
  deposit: z.number().min(0, "Deposit cannot be negative").default(0),
  city: z.string().min(2, "City is required"),
  neighborhood: z.string().min(2, "Neighborhood is required"),
  addressDetails: z.string().optional().default(""),
  bedrooms: z.number().int().min(0, "Bedrooms cannot be negative").default(1),
  bathrooms: z.number().min(0.5, "Bathrooms must be at least 0.5").default(1),
  sizeM2: z.number().min(10, "Size must be at least 10 m²").default(50),
  amenities: z.array(z.string()).default([]),
  houseRules: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        url: z.string().url("Must be a valid image URL"),
        publicId: z.string().optional(),
        caption: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })
    )
    .min(1, "At least one property photo is required"),
});

export const InquirySchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  message: z
    .string()
    .min(10, "Inquiry message must be at least 10 characters")
    .max(1000, "Message cannot exceed 1000 characters"),
  requestedViewingDate: z.string().optional(),
});

export const AgreementSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  agreedRent: z.number().min(500, "Agreed rent must be at least 500 ETB"),
  deposit: z.number().min(0).default(0),
  startDate: z.string().min(1, "Start date is required"),
  durationMonths: z.number().int().min(1).max(60).default(6),
});

export const CommissionReconcileSchema = z.object({
  paymentStatus: z.enum(["paid", "waived", "disputed"]),
  paymentReference: z.string().min(3, "Payment transaction reference is required"),
  paymentMethod: z.enum(["bank_transfer", "telebirr_manual", "cbe_birr", "admin_reconciled"]),
  reconciledNotes: z.string().optional().default(""),
});

export const DisputeSchema = z.object({
  targetType: z.enum(["property", "landlord", "tenant", "agreement", "commission"]),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(5, "Reason is required"),
  description: z.string().min(15, "Please provide detailed description of the dispute"),
});

export const VerificationUpdateSchema = z.object({
  ownerVerificationStatus: z.enum(["pending", "verified", "rejected"]),
  physicalInspectionStatus: z.enum(["not_requested", "scheduled", "inspected", "rejected"]),
  inspectionDate: z.string().optional(),
  inspectorName: z.string().optional(),
  notes: z.string().optional(),
});
