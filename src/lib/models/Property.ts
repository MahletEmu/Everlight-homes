import mongoose, { Schema, Model } from "mongoose";
import { IProperty } from "@/types";

const PropertyImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    caption: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const PropertySchema = new Schema<IProperty>(
  {
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Landlord reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [140, "Title cannot exceed 140 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    propertyType: {
      type: String,
      enum: ["apartment", "house", "condo", "private_room", "shared", "commercial"],
      required: [true, "Property type is required"],
      index: true,
    },
    monthlyRent: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: [500, "Monthly rent must be at least 500 ETB"],
      index: true,
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, "Deposit cannot be negative"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      index: true,
    },
    neighborhood: {
      type: String,
      required: [true, "Neighborhood is required"],
      trim: true,
      index: true,
    },
    addressDetails: {
      type: String,
      trim: true,
      default: "",
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    sizeM2: {
      type: Number,
      required: true,
      min: 10,
      default: 50,
    },
    amenities: {
      type: [String],
      default: [],
    },
    houseRules: {
      type: [String],
      default: [],
    },
    images: {
      type: [PropertyImageSchema],
      default: [],
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "rented", "withdrawn"],
      default: "available",
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: ["pending_review", "approved", "rejected"],
      default: "pending_review",
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "owner_verified", "physically_inspected", "fully_verified"],
      default: "unverified",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for marketplace search & filtering
PropertySchema.index({ moderationStatus: 1, availabilityStatus: 1, city: 1, monthlyRent: 1 });
PropertySchema.index({ moderationStatus: 1, availabilityStatus: 1, propertyType: 1 });

export const Property: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);
