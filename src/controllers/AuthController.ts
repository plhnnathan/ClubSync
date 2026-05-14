import { Request, Response } from "express";
import authService from "../services/AuthService";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, clubName } = req.body;

      if (!name || !email || !password || !clubName) {
        res.status(400).json({
          message: "All fields are required: name, email, password, clubName.",
        });
        return;
      }

      const result = await authService.register({
        name,
        email,
        password,
        clubName,
      });
      res
        .status(201)
        .json({ message: "Account created successfully.", ...result });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Email already in use" ? 409 : 500;
      res.status(status).json({ message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." });
        return;
      }

      const result = await authService.login({ email, password });
      res.status(200).json({ message: "Login successful.", ...result });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Invalid credentials" ? 401 : 500;
      res.status(status).json({ message });
    }
  }

  async createAnalyst(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const clubId = req.user!.clubId;

      if (!name || !email || !password) {
        res
          .status(400)
          .json({ message: "All fields are required: name, email, password." });
        return;
      }

      const user = await authService.createAnalyst(
        { name, email, password },
        clubId,
      );
      res.status(201).json({ message: "Analyst created successfully.", user });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const status = message === "Email already in use" ? 409 : 500;
      res.status(status).json({ message });
    }
  }
}

export default new AuthController();
