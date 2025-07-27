import { Request, Response } from "express";
import { getUserId } from "../../auth.ts";
import { db } from "../../db/connection.ts";
import { boards } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export const getBoardController = async (req: Request, res: Response) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ error: "Invalid board ID" });
      return;
    }

    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));
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