import { Request, Response } from "express";
import { getBoardsByUserId } from "../../data-access/boards.ts";

export const getBoardsController = async (req: Request, res: Response) => {
  try {
    const userBoards = await getBoardsByUserId(req.userId!);
    res.json(userBoards);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
}; 