export type UserRole = "tenant" | "landlord" | "admin";
export type AccountStatus = "active" | "suspended";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type PropertyType =
  | "apartment"
  | "house"
  | "condo"
  | "private_room"
  | "shared"
  | "commercial";

export type AvailabilityStatus = "available" | "rented" | "withdrawn";
export type ModerationStatus = "pending_review" | "approved" | "rejected";
export type VerificationTier =
  | "unverified"
  | "owner_verified"
  | "physically_inspected"
  | "fully_verified";

export interface IPropertyImage {
  url: string;
  publicId?: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface IProperty {
  _id: string;
  landlordId: string | IUser;
  title: string;
  description: string;
  propertyType: PropertyType;
  monthlyRent: number; // in ETB
  deposit: number; // in ETB
  city: string;
  neighborhood: string;
  addressDetails?: string; // Private to confirmed tenants / admin
  bedrooms: number;
  bathrooms: number;
  sizeM2: number;
  amenities: string[];
  houseRules?: string[];
  images: IPropertyImage[];
  availabilityStatus: AvailabilityStatus;
  moderationStatus: ModerationStatus;
  verificationStatus: VerificationTier;
  rejectionReason?: string;
  featured?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IFavorite {
  _id: string;
  tenantId: string | IUser;
  propertyId: string | IProperty;
  createdAt: string | Date;
}

export type InquiryStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "viewing_scheduled"
  | "completed";

export interface IRentalInquiry {
  _id: string;
  propertyId: string | IProperty;
  tenantId: string | IUser;
  landlordId: string | IUser;
  message: string;
  requestedViewingDate?: string | Date;
  status: InquiryStatus;
  landlordNote?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type AgreementStatus =
  | "draft"
  | "pending_confirmation"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface IRentalAgreement {
  _id: string;
  propertyId: string | IProperty;
  landlordId: string | IUser;
  tenantId: string | IUser;
  agreedRent: number; // in ETB
  deposit: number; // in ETB
  startDate: string | Date;
  durationMonths: number;
  landlordConfirmed: boolean;
  tenantConfirmed: boolean;
  landlordConfirmedAt?: string | Date;
  tenantConfirmedAt?: string | Date;
  status: AgreementStatus;
  cancellationReason?: string;
  commissionRecordId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type CommissionPaymentStatus = "pending" | "paid" | "waived" | "disputed";
export type PaymentMethod =
  | "bank_transfer"
  | "telebirr_manual"
  | "cbe_birr"
  | "admin_reconciled";

export interface ICommissionRecord {
  _id: string;
  agreementId: string | IRentalAgreement;
  propertyId: string | IProperty;
  payerId: string | IUser;
  payerRole: "landlord" | "tenant";
  commissionBasis: string; // e.g., "50% of first month's rent (ETB 30,000)"
  ratePercentage: number;
  amountETB: number;
  paymentStatus: CommissionPaymentStatus;
  paymentReference?: string;
  paymentMethod?: PaymentMethod;
  reconciledByAdminId?: string | IUser;
  reconciledNotes?: string;
  dueDate: string | Date;
  paidAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IVerificationRecord {
  _id: string;
  propertyId: string | IProperty;
  landlordId: string | IUser;
  reviewingAdminId?: string | IUser;
  ownerVerificationStatus: "pending" | "verified" | "rejected";
  physicalInspectionStatus:
    | "not_requested"
    | "scheduled"
    | "inspected"
    | "rejected";
  inspectionDate?: string | Date;
  inspectorName?: string;
  notes?: string;
  documentProofUrls?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type DisputeStatus = "open" | "under_review" | "resolved" | "dismissed";

export interface IReportDispute {
  _id: string;
  reportingUserId: string | IUser;
  targetType: "property" | "landlord" | "tenant" | "agreement" | "commission";
  targetId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  assignedAdminId?: string | IUser;
  resolutionNotes?: string;
  resolvedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IAuditLog {
  _id: string;
  adminId: string | IUser;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string | Date;
}
