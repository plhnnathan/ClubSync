import mongoose, { Document, Schema } from "mongoose";

export interface IClub extends Document {
  name: string;
  slug: string;
  createdAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IClub>("Club", ClubSchema);
