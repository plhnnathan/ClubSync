import mongoose, { Document, Schema } from "mongoose";

export interface IMatchReport extends Document {
  playerId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  opponent: string;
  matchDate: Date;
  minutesPlayed: number;
  goals: number;
  assists: number;
  sofascoreRating: number;
  createdAt: Date;
}

const MatchReportSchema = new Schema<IMatchReport>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player ID is required"],
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club ID is required"],
    },
    opponent: {
      type: String,
      required: [true, "Opponent name is required"],
      trim: true,
    },
    matchDate: {
      type: Date,
      required: [true, "Match date is required"],
    },
    minutesPlayed: {
      type: Number,
      required: [true, "Minutes played is required"],
      min: 0,
      max: 120,
    },
    goals: {
      type: Number,
      default: 0,
      min: 0,
    },
    assists: {
      type: Number,
      default: 0,
      min: 0,
    },
    sofascoreRating: {
      type: Number,
      required: [true, "Sofascore rating is required"],
      min: 0,
      max: 10,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IMatchReport>("MatchReport", MatchReportSchema);
