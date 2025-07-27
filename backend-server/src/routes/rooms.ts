import { Router } from "express";
import { makeToken, getUserId } from "../auth.ts";
import { scheduler } from "../scheduler.ts";
import { db } from "../db/connection.ts";
import { boards, type InsertBoard } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const router = Router();

// createRoom - now creates a board
router.post("/", async (req, res) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    // Create a room/session
    const roomId = await scheduler.createRoom();

    // Create a corresponding board
    const newBoard: InsertBoard = {
      name: `Board ${Date.now()}`, // Generate a default name
      userId: userId, // Associate board with the creating user
      data: { shapes: [], cursors: [] },
      hathoraRoomId: roomId
    };

    const [createdBoard] = await db.insert(boards).values(newBoard).returning();
    console.log(
      `Room ${roomId} created by user ${userId} with board ${createdBoard.id}`
    );

    res.json({ roomId, boardId: createdBoard.id });
  } catch (error) {
    console.error("Failed to create room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// lookupRoom - now looks up by board's hathora room ID
router.get("/:roomId", async (req, res) => {
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
});

export default router;
