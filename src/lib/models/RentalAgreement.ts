import mongoose, { Schema, Model } from "mongoose";
import { IRentalAgreement } from "@/types";

const RentalAgreementSchema = new Schema<IRentalAgreement>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agreedRent: {
      type: Number,
      required: [true, "Agreed rent is required"],
      min: [500, "Agreed rent must be at least 500 ETB"],
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, "Deposit cannot be negative"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    durationMonths: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 month"],
      default: 6,
    },
    landlordConfirmed: {
      type: Boolean,
      default: false,
    },
    tenantConfirmed: {
      type: Boolean,
      default: false,
    },
    landlordConfirmedAt: {
      type: Date,
    },
    tenantConfirmedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "pending_confirmation", "confirmed", "completed", "cancelled"],
      default: "pending_confirmation",
      index: true,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    commissionRecordId: {
      type: Schema.Types.ObjectId,
      ref: "CommissionRecord",
    },
  },
  {
    timestamps: true,
  }
);

RentalAgreementSchema.index({ landlordId: 1, status: 1 });
RentalAgreementSchema.index({ tenantId: 1, status: 1 });
RentalAgreementSchema.index({ propertyId: 1, status: 1 });

export const RentalAgreement: Model<IRentalAgreement> =
  mongoose.models.RentalAgreement ||
  mongoose.model<IRentalAgreement>("RentalAgreement", RentalAgreementSchema);
