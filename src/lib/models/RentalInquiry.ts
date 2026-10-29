import mongoose, { Schema, Model } from "mongoose";
import { IRentalInquiry } from "@/types";

const RentalInquirySchema = new Schema<IRentalInquiry>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, "Inquiry message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    requestedViewingDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "viewing_scheduled", "completed"],
      default: "pending",
      index: true,
    },
    landlordNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

RentalInquirySchema.index({ landlordId: 1, status: 1 });
RentalInquirySchema.index({ tenantId: 1, status: 1 });

export const RentalInquiry: Model<IRentalInquiry> =
  mongoose.models.RentalInquiry ||
  mongoose.model<IRentalInquiry>("RentalInquiry", RentalInquirySchema);
