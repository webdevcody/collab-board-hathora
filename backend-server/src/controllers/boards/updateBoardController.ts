import { Request, Response } from "express";
import { z } from "zod";
import { getBoardById, updateBoard } from "../../data-access/boards.ts";

const updateBoardParamsSchema = z.object({
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

const updateBoardBodySchema = z.object({
  name: z.string().min(1, "Board name must be a non-empty string").optional(),
  data: z.any().optional()
});

export const updateBoardController = async (req: Request, res: Response) => {
  const validatedParams = updateBoardParamsSchema.parse(req.params);
  const validatedBody = updateBoardBodySchema.parse(req.body);
  
  const boardId = validatedParams.id;

  // Check if the board exists
  const existingBoard = await getBoardById(boardId);

  if (!existingBoard) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  // Only check ownership for client requests, not session server requests
  if (!req.isSessionServer && existingBoard.userId !== req.userId!) {
    res
      .status(403)
      .json({ error: "You don't have permission to update this board" });
    return;
  }

  const updates: any = {};

  if (validatedBody.name !== undefined) {
    updates.name = validatedBody.name.trim();
  }

  if (validatedBody.data !== undefined) {
    updates.data = validatedBody.data;
  }

  const updatedBoard = await updateBoard(boardId, updates);
  res.json(updatedBoard);
}; 