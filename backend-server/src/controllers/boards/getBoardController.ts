import { Request, Response } from "express";
import { getBoardById } from "../../data-access/boards.ts";

export const getBoardController = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ error: "Invalid board ID" });
      return;
    }

    const board = await getBoardById(boardId);
    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    res.json(board);
  } catch (error) {
    console.error("Failed to fetch board:", error);
    res.status(500).json({ error: "Failed to fetch board" });
  }
}; 