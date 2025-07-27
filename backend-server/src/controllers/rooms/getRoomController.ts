import { Request, Response } from "express";
import { makeToken, getUserId } from "../../auth.ts";
import { scheduler } from "../../scheduler.ts";
import { db } from "../../db/connection.ts";
import { boards } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export const getRoomController = async (req: Request, res: Response) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  const roomId = req.params.roomId;

  try {
    // Find board by hathora room ID
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.hathoraRoomId, roomId));

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