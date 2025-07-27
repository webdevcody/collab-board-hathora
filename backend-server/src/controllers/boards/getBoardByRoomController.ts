import { Request, Response } from "express";
import { authMiddleware } from "../../auth.ts";
import { db } from "../../db/connection.ts";
import { boards } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export const getBoardByRoomController = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId;
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.hathoraRoomId, roomId));

    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    res.json(board);
  } catch (error) {
    console.error("Failed to fetch board by room ID:", error);
    res.status(500).json({ error: "Failed to fetch board" });
  }
}; 