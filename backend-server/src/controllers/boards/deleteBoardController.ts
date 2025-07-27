import { Request, Response } from "express";
import { getBoardById, deleteBoard } from "../../data-access/boards.ts";

export const deleteBoardController = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ error: "Invalid board ID" });
      return;
    }

    // Check if the board belongs to the user
    const existingBoard = await getBoardById(boardId);

    if (!existingBoard) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (existingBoard.userId !== req.userId!) {
      res
        .status(403)
        .json({ error: "You don't have permission to delete this board" });
      return;
    }

    await deleteBoard(boardId);
    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Failed to delete board:", error);
    res.status(500).json({ error: "Failed to delete board" });
  }
}; 