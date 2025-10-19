import mongoose, { Document, Schema } from "mongoose";

// Interface representing a document in MongoDB.
export interface IBrand extends Document {
  brandName: string;
  yearFounded: number;
  headquarters: string;
  numberOfLocations: number;
}

// Mongoose schema definition based on the provided file
const BrandSchema: Schema = new Schema(
  {
    brandName: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
    },
    yearFounded: {
      type: Number,
      required: [true, "Year founded is required"],
      min: [1600, "Year founded seems too old"],
      max: [new Date().getFullYear(), "Year founded cannot be in the future"],
    },
    headquarters: {
      type: String,
      required: [true, "Headquarters location is required"],
      trim: true,
    },
    numberOfLocations: {
      type: Number,
      required: [true, "Number of locations is required"],
      min: [1, "There should be at least one location"],
    },
  },
  {
    // Add timestamps (createdAt, updatedAt)
    timestamps: true,
  }
);

// Create and export the Mongoose model
export const Brand = mongoose.model<IBrand>("Brand", BrandSchema);
