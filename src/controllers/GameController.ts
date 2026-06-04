import { Request, Response } from "express";
import Game from "../models/Game";

export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const games = await Game.find().sort({ date: -1 });
    res.status(200).json({ data: games });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGameById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      res.status(404).json({ message: "Jogo não encontrado." });
      return;
    }
    res.status(200).json({ data: game });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createGame = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newGame = new Game(req.body);
    const savedGame = await newGame.save();
    res.status(201).json({ data: savedGame });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateGame = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedGame) {
      res.status(404).json({ message: "Jogo não encontrado." });
      return;
    }
    res.status(200).json({ data: updatedGame });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGame = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deletedGame = await Game.findByIdAndDelete(req.params.id);
    if (!deletedGame) {
      res.status(404).json({ message: "Jogo não encontrado." });
      return;
    }
    res.status(200).json({ message: "Jogo excluído com sucesso." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
