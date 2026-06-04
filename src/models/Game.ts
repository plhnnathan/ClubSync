import mongoose, { Schema, Document } from "mongoose";

interface IStat {
  id: string;
  label: string;
  type: string;
  home: number;
  away: number;
}

export interface IGame extends Document {
  homeTeam: string;
  awayTeam: string;
  date: Date;
  homeScore: number | null;
  awayScore: number | null;
  stats: IStat[];
}

const StatSchema = new Schema<IStat>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 },
  },
  { _id: false },
);

const GameSchema = new Schema<IGame>(
  {
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    date: { type: Date, required: true },
    homeScore: { type: Number, default: null },
    awayScore: { type: Number, default: null },
    stats: [StatSchema],
  },
  { timestamps: true },
);

export default mongoose.model<IGame>("Game", GameSchema);
