import { Request, Response } from "express";
import matchReportService from "../services/MatchReportService";

export class MatchReportController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const reports = await matchReportService.getAllMatchReports(
        req.user!.clubId,
      );
      res.status(200).json({ data: reports, total: reports.length });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      res.status(500).json({ message });
    }
  }

  async getByPlayer(req: Request, res: Response): Promise<void> {
    try {
      const reports = await matchReportService.getMatchReportsByPlayer(
        String(req.params.playerId),
        req.user!.clubId,
      );
      res.status(200).json({ data: reports, total: reports.length });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      res.status(500).json({ message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const report = await matchReportService.getMatchReportById(
        String(req.params.id),
        req.user!.clubId,
      );
      res.status(200).json({ data: report });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Match report not found" ? 404 : 500;
      res.status(status).json({ message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        playerId,
        opponent,
        matchDate,
        minutesPlayed,
        goals,
        assists,
        sofascoreRating,
      } = req.body;

      if (
        !playerId ||
        !opponent ||
        !matchDate ||
        !minutesPlayed ||
        sofascoreRating === undefined
      ) {
        res.status(400).json({
          message:
            "Required fields: playerId, opponent, matchDate, minutesPlayed, sofascoreRating.",
        });
        return;
      }

      const report = await matchReportService.createMatchReport({
        playerId,
        clubId: req.user!.clubId,
        opponent,
        matchDate,
        minutesPlayed,
        goals,
        assists,
        sofascoreRating,
      });

      res
        .status(201)
        .json({ message: "Match report created successfully.", data: report });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message.includes("not found") ? 404 : 500;
      res.status(status).json({ message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const report = await matchReportService.updateMatchReport(
        String(req.params.id),
        req.user!.clubId,
        req.body,
      );
      res
        .status(200)
        .json({ message: "Match report updated successfully.", data: report });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Match report not found" ? 404 : 500;
      res.status(status).json({ message });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await matchReportService.deleteMatchReport(
        String(req.params.id),
        req.user!.clubId,
      );
      res.status(204).send();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Match report not found" ? 404 : 500;
      res.status(status).json({ message });
    }
  }
}

export default new MatchReportController();
