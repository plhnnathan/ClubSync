import MatchReport, { IMatchReport } from "../models/MatchReport";
import Player from "../models/Player";

interface CreateMatchReportInput {
  playerId: string;
  clubId: string;
  opponent: string;
  matchDate: Date;
  minutesPlayed: number;
  goals?: number;
  assists?: number;
  sofascoreRating: number;
}

interface UpdateMatchReportInput {
  opponent?: string;
  matchDate?: Date;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  sofascoreRating?: number;
}

export class MatchReportService {
  async getAllMatchReports(clubId: string): Promise<IMatchReport[]> {
    return MatchReport.find({ clubId })
      .populate("playerId", "name position jerseyNumber")
      .sort({ matchDate: -1 });
  }

  async getMatchReportsByPlayer(
    playerId: string,
    clubId: string,
  ): Promise<IMatchReport[]> {
    return MatchReport.find({ playerId, clubId })
      .populate("playerId", "name position jerseyNumber")
      .sort({ matchDate: -1 });
  }

  async getMatchReportById(id: string, clubId: string): Promise<IMatchReport> {
    const report = await MatchReport.findOne({ _id: id, clubId }).populate(
      "playerId",
      "name position jerseyNumber",
    );

    if (!report) {
      throw new Error("Match report not found");
    }

    return report;
  }

  async createMatchReport(
    input: CreateMatchReportInput,
  ): Promise<IMatchReport> {
    const player = await Player.findOne({
      _id: input.playerId,
      clubId: input.clubId,
    });

    if (!player) {
      throw new Error("Player not found or does not belong to your club");
    }

    return MatchReport.create(input);
  }

  async updateMatchReport(
    id: string,
    clubId: string,
    input: UpdateMatchReportInput,
  ): Promise<IMatchReport> {
    const report = await MatchReport.findOneAndUpdate(
      { _id: id, clubId },
      { $set: input },
      { new: true, runValidators: true },
    );

    if (!report) {
      throw new Error("Match report not found");
    }

    return report;
  }

  async deleteMatchReport(id: string, clubId: string): Promise<void> {
    const report = await MatchReport.findOneAndDelete({ _id: id, clubId });
    if (!report) {
      throw new Error("Match report not found");
    }
  }
}

export default new MatchReportService();
