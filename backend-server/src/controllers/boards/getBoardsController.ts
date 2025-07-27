import { Request, Response } from "express";
import { getUserId } from "../../auth.ts";
import { db } from "../../db/connection.ts";
import { boards } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export const getBoardsController = async (req: Request, res: Response) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const userBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, userId));
    res.json(userBoards);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
}; 