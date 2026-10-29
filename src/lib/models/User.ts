import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // Don't return password hash in regular queries
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["tenant", "landlord", "admin"],
      default: "tenant",
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation in Next.js hot reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
