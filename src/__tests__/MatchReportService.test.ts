import { MatchReportService } from "../services/MatchReportService";
import MatchReport from "../models/MatchReport";
import Player from "../models/Player";

jest.mock("../models/MatchReport");
jest.mock("../models/Player");

const matchReportService = new MatchReportService();
const mockClubId = "6a0644df8b6eb3e954e3489f";
const mockPlayerId = "6a064bb5bd3f656b862a81f0";
const mockReportId = "6a064bb5bd3f656b862a81f1";

const mockPlayer = {
  _id: mockPlayerId,
  name: "Gabriel Silva",
  clubId: mockClubId,
};

const mockReport = {
  _id: mockReportId,
  playerId: mockPlayerId,
  clubId: mockClubId,
  opponent: "FC Rival",
  matchDate: new Date("2026-05-10"),
  minutesPlayed: 90,
  goals: 2,
  assists: 1,
  sofascoreRating: 8.5,
};

describe("MatchReportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMatchReport", () => {
    it("should create a match report when player belongs to the club", async () => {
      jest.mocked(Player.findOne).mockResolvedValue(mockPlayer as any);
      jest.mocked(MatchReport.create).mockResolvedValue(mockReport as any);

      const result = await matchReportService.createMatchReport({
        playerId: mockPlayerId,
        clubId: mockClubId,
        opponent: "FC Rival",
        matchDate: new Date("2026-05-10"),
        minutesPlayed: 90,
        goals: 2,
        assists: 1,
        sofascoreRating: 8.5,
      });

      expect(Player.findOne).toHaveBeenCalledWith({
        _id: mockPlayerId,
        clubId: mockClubId,
      });
      expect(result.opponent).toBe("FC Rival");
    });

    it("should throw an error when player does not belong to the club", async () => {
      jest.mocked(Player.findOne).mockResolvedValue(null);

      await expect(
        matchReportService.createMatchReport({
          playerId: "wrong-id",
          clubId: mockClubId,
          opponent: "FC Rival",
          matchDate: new Date("2026-05-10"),
          minutesPlayed: 90,
          sofascoreRating: 7.0,
        }),
      ).rejects.toThrow("Player not found or does not belong to your club");
    });
  });

  describe("getMatchReportById", () => {
    it("should return a match report when found", async () => {
      jest.mocked(MatchReport.findOne).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockReport),
      } as any);

      const result = await matchReportService.getMatchReportById(
        mockReportId,
        mockClubId,
      );

      expect(result.opponent).toBe("FC Rival");
    });

    it("should throw an error when match report is not found", async () => {
      jest.mocked(MatchReport.findOne).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        matchReportService.getMatchReportById("nonexistent-id", mockClubId),
      ).rejects.toThrow("Match report not found");
    });
  });
});
