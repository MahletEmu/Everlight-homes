import mongoose, { Schema, Model } from "mongoose";
import { IReportDispute } from "@/types";

const ReportDisputeSchema = new Schema<IReportDispute>(
  {
    reportingUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["property", "landlord", "tenant", "agreement", "commission"],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Detailed description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    assignedAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ReportDispute: Model<IReportDispute> =
  mongoose.models.ReportDispute ||
  mongoose.model<IReportDispute>("ReportDispute", ReportDisputeSchema);
