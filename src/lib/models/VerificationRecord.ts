import mongoose, { Schema, Model } from "mongoose";
import { IVerificationRecord } from "@/types";

const VerificationRecordSchema = new Schema<IVerificationRecord>(
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
    reviewingAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ownerVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    physicalInspectionStatus: {
      type: String,
      enum: ["not_requested", "scheduled", "inspected", "rejected"],
      default: "not_requested",
      index: true,
    },
    inspectionDate: {
      type: Date,
    },
    inspectorName: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    documentProofUrls: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

VerificationRecordSchema.index({ propertyId: 1, landlordId: 1 });

export const VerificationRecord: Model<IVerificationRecord> =
  mongoose.models.VerificationRecord ||
  mongoose.model<IVerificationRecord>("VerificationRecord", VerificationRecordSchema);
