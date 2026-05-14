import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "admin" | "analyst";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  clubId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "analyst"],
      default: "admin",
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club ID is required"],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
