import mongoose, { Document, Schema } from "mongoose";

export type Position =
  | "Goalkeeper"
  | "Right Back"
  | "Left Back"
  | "Center Back"
  | "Defensive Midfielder"
  | "Midfielder"
  | "Attacking Midfielder"
  | "Right Winger"
  | "Left Winger"
  | "Striker";

export type PlayerStatus = "Active" | "Injured" | "On Loan";
export type DominantFoot = "Right" | "Left" | "Both";

export interface IPlayer extends Document {
  name: string;
  position: Position;
  jerseyNumber: number;
  dominantFoot: DominantFoot;
  status: PlayerStatus;
  clubId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      enum: [
        "Goalkeeper",
        "Right Back",
        "Left Back",
        "Center Back",
        "Defensive Midfielder",
        "Midfielder",
        "Attacking Midfielder",
        "Right Winger",
        "Left Winger",
        "Striker",
      ],
    },
    jerseyNumber: {
      type: Number,
      required: [true, "Jersey number is required"],
      min: 1,
      max: 99,
    },
    dominantFoot: {
      type: String,
      required: [true, "Dominant foot is required"],
      enum: ["Right", "Left", "Both"],
    },
    status: {
      type: String,
      enum: ["Active", "Injured", "On Loan"],
      default: "Active",
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club ID is required"],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPlayer>("Player", PlayerSchema);
