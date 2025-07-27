import { Request, Response } from "express";
import { z } from "zod";
import { getBoardByRoomId } from "../../data-access/boards.ts";

const roomIdSchema = z.object({
  roomId: z.string().min(1, "Room ID is required")
});

export const getBoardByRoomController = async (req: Request, res: Response) => {
  const validatedData = roomIdSchema.parse(req.params);
  const roomId = validatedData.roomId;

  const board = await getBoardByRoomId(roomId);

  if (!board) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  res.json(board);
};
