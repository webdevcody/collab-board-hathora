import { Request, Response } from "express";
import { z } from "zod";
import { makeToken } from "../../auth.ts";
import { scheduler } from "../../scheduler.ts";
import { getBoardByRoomId } from "../../data-access/boards.ts";

const roomIdSchema = z.object({
  roomId: z.string().min(1, "Room ID is required")
});

export const getRoomController = async (req: Request, res: Response) => {
  const validatedData = roomIdSchema.parse(req.params);
  const roomId = validatedData.roomId;

  // Find board by hathora room ID
  const board = await getBoardByRoomId(roomId);

  const host = await scheduler.getRoomHost(roomId);
  if (host == null) {
    res.json({ host, token: null, board: null });
    return;
  }

  const token = makeToken({ userId: req.userId!, roomId, host });
  res.json({ host, token, board });
}; 