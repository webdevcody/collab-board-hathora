import { Request, Response } from "express";
import { z } from "zod";
import { getBoardById } from "../../data-access/boards.ts";

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

export const getBoardController = async (req: Request, res: Response) => {
  const validatedData = boardIdSchema.parse(req.params);
  const boardId = validatedData.id;

  const board = await getBoardById(boardId);
  if (!board) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  res.json(board);
}; 