import { Request, Response } from "express";
import { authMiddleware } from "../../auth.ts";
import { db } from "../../db/connection.ts";
import { boards, type InsertBoard } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export const updateBoardController = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ error: "Invalid board ID" });
      return;
    }

    // Check if the board exists
    const [existingBoard] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));

    if (!existingBoard) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    // Only check ownership for client requests, not session server requests
    if (!req.isSessionServer && existingBoard.userId !== req.userId) {
      res
        .status(403)
        .json({ error: "You don't have permission to update this board" });
      return;
    }

    const { name, data } = req.body;
    const updates: Partial<InsertBoard> = {};

    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400).json({ error: "Board name must be a string" });
        return;
      }
      updates.name = name.trim();
    }

    if (data !== undefined) {
      updates.data = data;
    }

    const [updatedBoard] = await db
      .update(boards)
      .set(updates)
      .where(eq(boards.id, boardId))
      .returning();

    res.json(updatedBoard);
  } catch (error) {
    console.error("Failed to update board:", error);
    res.status(500).json({ error: "Failed to update board" });
  }
}; 