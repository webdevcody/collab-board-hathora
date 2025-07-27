import { Request, Response } from "express";
import { z } from "zod";
import { getBoardById, deleteBoard } from "../../data-access/boards.ts";

const boardIdSchema = z.object({
  id: z.string().min(1, "Board ID is required").transform((val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed)) {
      throw new z.ZodError([{
        code: "custom",
        message: "Invalid board ID",
        path: ["id"],
        input: val
      }]);
    }
    return parsed;
  })
});

export const deleteBoardController = async (req: Request, res: Response) => {
  const validatedData = boardIdSchema.parse(req.params);
  const boardId = validatedData.id;

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
}; 