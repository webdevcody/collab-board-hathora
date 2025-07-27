import { Request, Response } from "express";
import { getUserId } from "../../auth.ts";
import { db } from "../../db/connection.ts";
import { boards } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export const deleteBoardController = async (req: Request, res: Response) => {
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

    // Check if the board belongs to the user
    const [existingBoard] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));

    if (!existingBoard) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (existingBoard.userId !== userId) {
      res
        .status(403)
        .json({ error: "You don't have permission to delete this board" });
      return;
    }

    const [deletedBoard] = await db
      .delete(boards)
      .where(eq(boards.id, boardId))
      .returning();

    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Failed to delete board:", error);
    res.status(500).json({ error: "Failed to delete board" });
  }
}; 