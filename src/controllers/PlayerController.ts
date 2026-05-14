import { Request, Response } from "express";
import playerService from "../services/PlayerService";

export class PlayerController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const players = await playerService.getAllPlayers(req.user!.clubId);
      res.status(200).json({ data: players, total: players.length });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      res.status(500).json({ message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const player = await playerService.getPlayerById(
        String(req.params.id),
        req.user!.clubId,
      );
      res.status(200).json({ data: player });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Player not found" ? 404 : 500;
      res.status(status).json({ message });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await playerService.getPlayerStats(
        String(req.params.id),
        req.user!.clubId,
      );
      res.status(200).json({ data: stats });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Player not found" ? 404 : 500;
      res.status(status).json({ message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, position, jerseyNumber, dominantFoot, status } = req.body;

      if (!name || !position || !jerseyNumber || !dominantFoot) {
        res.status(400).json({
          message:
            "Required fields: name, position, jerseyNumber, dominantFoot.",
        });
        return;
      }

      const player = await playerService.createPlayer({
        name,
        position,
        jerseyNumber,
        dominantFoot,
        status,
        clubId: req.user!.clubId,
      });

      res
        .status(201)
        .json({ message: "Player created successfully.", data: player });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Jersey number already in use" ? 409 : 500;
      res.status(status).json({ message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const player = await playerService.updatePlayer(
        String(req.params.id),
        req.user!.clubId,
        req.body,
      );
      res
        .status(200)
        .json({ message: "Player updated successfully.", data: player });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status =
        message === "Player not found"
          ? 404
          : message === "Jersey number already in use"
            ? 409
            : 500;
      res.status(status).json({ message });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await playerService.deletePlayer(String(req.params.id), req.user!.clubId);
      res.status(204).send();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Player not found" ? 404 : 500;
      res.status(status).json({ message });
    }
  }
}

export default new PlayerController();
