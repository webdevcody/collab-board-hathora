import { Request, Response } from "express";
import { makeToken, getUserId } from "../../auth.ts";
import { scheduler } from "../../scheduler.ts";
import { getBoardByRoomId } from "../../data-access/boards.ts";

export const getRoomController = async (req: Request, res: Response) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  const roomId = req.params.roomId;

  try {
    // Find board by hathora room ID
    const board = await getBoardByRoomId(roomId);

    const host = await scheduler.getRoomHost(roomId);
    if (host == null) {
      res.json({ host, token: null, board: null });
      return;
    }

    const token = makeToken({ userId, roomId, host });
    res.json({ host, token, board });
  } catch (error) {
    console.error("Failed to lookup room:", error);
    res.status(500).json({ error: "Failed to lookup room" });
  }
}; 