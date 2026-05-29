import { Request, Response } from "express";
import clubService from "../services/ClubService";

export class ClubController {
  async getClub(req: Request, res: Response): Promise<void> {
    try {
      const club = await clubService.getClub(req.user!.clubId);
      res.status(200).json({ data: club });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      res.status(404).json({ message });
    }
  }

  async updateClub(req: Request, res: Response): Promise<void> {
    try {
      const { name, logoUrl, primaryColor } = req.body;
      const club = await clubService.updateClub(req.user!.clubId, {
        name,
        logoUrl,
        primaryColor,
      });
      res
        .status(200)
        .json({ message: "Club updated successfully.", data: club });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      res.status(500).json({ message });
    }
  }

  async getMembers(req: Request, res: Response): Promise<void> {
    try {
      const members = await clubService.getClubMembers(req.user!.clubId);
      res.status(200).json({ data: members });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      res.status(500).json({ message });
    }
  }
}

export default new ClubController();
