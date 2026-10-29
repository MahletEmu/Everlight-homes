import mongoose, { Schema, Model } from "mongoose";
import { IFavorite } from "@/types";

const FavoriteSchema = new Schema<IFavorite>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent duplicate favorites by the same tenant
FavoriteSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });

export const Favorite: Model<IFavorite> =
  mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);
