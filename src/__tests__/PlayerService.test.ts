import { PlayerService } from "../services/PlayerService";
import Player from "../models/Player";

jest.mock("../models/Player");

const playerService = new PlayerService();
const mockClubId = "6a0644df8b6eb3e954e3489f";
const mockPlayerId = "6a064bb5bd3f656b862a81f0";

const mockPlayer = {
  _id: mockPlayerId,
  name: "Gabriel Silva",
  position: "Striker",
  jerseyNumber: 9,
  dominantFoot: "Right",
  status: "Active",
  clubId: mockClubId,
};

describe("PlayerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPlayers", () => {
    it("should return a list of players filtered by clubId", async () => {
      jest.mocked(Player.find).mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockPlayer]),
      } as any);

      const result = await playerService.getAllPlayers(mockClubId);

      expect(Player.find).toHaveBeenCalledWith({ clubId: mockClubId });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Gabriel Silva");
    });
  });

  describe("getPlayerById", () => {
    it("should return a player when found by id and clubId", async () => {
      jest.mocked(Player.findOne).mockResolvedValue(mockPlayer as any);

      const result = await playerService.getPlayerById(
        mockPlayerId,
        mockClubId,
      );

      expect(Player.findOne).toHaveBeenCalledWith({
        _id: mockPlayerId,
        clubId: mockClubId,
      });
      expect(result.name).toBe("Gabriel Silva");
    });

    it("should throw an error when player is not found", async () => {
      jest.mocked(Player.findOne).mockResolvedValue(null);

      await expect(
        playerService.getPlayerById("nonexistent-id", mockClubId),
      ).rejects.toThrow("Player not found");
    });
  });

  describe("createPlayer", () => {
    it("should throw an error when jersey number is already in use", async () => {
      jest.mocked(Player.findOne).mockResolvedValue(mockPlayer as any);

      await expect(
        playerService.createPlayer({
          name: "Another Player",
          position: "Midfielder",
          jerseyNumber: 9,
          dominantFoot: "Left",
          clubId: mockClubId,
        }),
      ).rejects.toThrow("Jersey number already in use");
    });
  });
});
