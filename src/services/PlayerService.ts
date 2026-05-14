import Player, { IPlayer } from "../models/Player";

interface CreatePlayerInput {
  name: string;
  position: string;
  jerseyNumber: number;
  dominantFoot: string;
  status?: string;
  clubId: string;
}

interface UpdatePlayerInput {
  name?: string;
  position?: string;
  jerseyNumber?: number;
  dominantFoot?: string;
  status?: string;
}

export class PlayerService {
  async getAllPlayers(clubId: string): Promise<IPlayer[]> {
    return Player.find({ clubId }).sort({ name: 1 });
  }

  async getPlayerById(id: string, clubId: string): Promise<IPlayer> {
    const player = await Player.findOne({ _id: id, clubId });
    if (!player) {
      throw new Error("Player not found");
    }
    return player;
  }

  async createPlayer(input: CreatePlayerInput): Promise<IPlayer> {
    const existingJersey = await Player.findOne({
      clubId: input.clubId,
      jerseyNumber: input.jerseyNumber,
    });

    if (existingJersey) {
      throw new Error("Jersey number already in use");
    }

    const player = new Player(input);
    return player.save();
  }

  async updatePlayer(
    id: string,
    clubId: string,
    input: UpdatePlayerInput,
  ): Promise<IPlayer> {
    if (input.jerseyNumber) {
      const existingJersey = await Player.findOne({
        clubId,
        jerseyNumber: input.jerseyNumber,
        _id: { $ne: id },
      });

      if (existingJersey) {
        throw new Error("Jersey number already in use");
      }
    }

    const player = await Player.findOneAndUpdate(
      { _id: id, clubId },
      { $set: input },
      { new: true, runValidators: true },
    );

    if (!player) {
      throw new Error("Player not found");
    }

    return player;
  }

  async deletePlayer(id: string, clubId: string): Promise<void> {
    const player = await Player.findOneAndDelete({ _id: id, clubId });
    if (!player) {
      throw new Error("Player not found");
    }
  }

  async getPlayerStats(id: string, clubId: string): Promise<object> {
    const player = await this.getPlayerById(id, clubId);

    const MatchReport = (await import("../models/MatchReport")).default;

    const reports = await MatchReport.find({ playerId: id, clubId });

    if (reports.length === 0) {
      return {
        player,
        stats: {
          matchesPlayed: 0,
          totalGoals: 0,
          totalAssists: 0,
          totalMinutesPlayed: 0,
          averageRating: 0,
        },
      };
    }

    const totalGoals = reports.reduce((sum, r) => sum + r.goals, 0);
    const totalAssists = reports.reduce((sum, r) => sum + r.assists, 0);
    const totalMinutes = reports.reduce((sum, r) => sum + r.minutesPlayed, 0);
    const averageRating =
      reports.reduce((sum, r) => sum + r.sofascoreRating, 0) / reports.length;

    return {
      player,
      stats: {
        matchesPlayed: reports.length,
        totalGoals,
        totalAssists,
        totalMinutesPlayed: totalMinutes,
        averageRating: parseFloat(averageRating.toFixed(2)),
      },
    };
  }
}

export default new PlayerService();
