import { Request, Response } from "express";
import { getUserId } from "../../auth.ts";
import { getBoardsByUserId } from "../../data-access/boards.ts";

export const getBoardsController = async (req: Request, res: Response) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const userBoards = await getBoardsByUserId(userId);
    res.json(userBoards);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
}; 