import mongoose, { Schema, Model } from "mongoose";
import { ICommissionRecord } from "@/types";

const CommissionRecordSchema = new Schema<ICommissionRecord>(
  {
    agreementId: {
      type: Schema.Types.ObjectId,
      ref: "RentalAgreement",
      required: true,
      unique: true, // 1:1 relationship per completed agreement
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    payerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    payerRole: {
      type: String,
      enum: ["landlord", "tenant"],
      default: "landlord",
    },
    commissionBasis: {
      type: String,
      required: true,
    },
    ratePercentage: {
      type: Number,
      required: true,
      default: 50,
    },
    amountETB: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "waived", "disputed"],
      default: "pending",
      index: true,
    },
    paymentReference: {
      type: String,
      trim: true,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "telebirr_manual", "cbe_birr", "admin_reconciled"],
    },
    reconciledByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reconciledNotes: {
      type: String,
      default: "",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

CommissionRecordSchema.index({ payerId: 1, paymentStatus: 1 });
CommissionRecordSchema.index({ paymentStatus: 1, dueDate: 1 });

export const CommissionRecord: Model<ICommissionRecord> =
  mongoose.models.CommissionRecord ||
  mongoose.model<ICommissionRecord>("CommissionRecord", CommissionRecordSchema);
