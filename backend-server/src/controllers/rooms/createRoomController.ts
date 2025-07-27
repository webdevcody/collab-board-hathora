import { Request, Response } from "express";
import { getUserId } from "../../auth.ts";
import { scheduler } from "../../scheduler.ts";
import { db } from "../../db/connection.ts";
import { boards, type InsertBoard } from "../../db/schema.ts";

export const createRoomController = async (req: Request, res: Response) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    // Create a room/session
    const roomId = Math.random().toString(36).slice(2);
    await scheduler.createRoom(roomId);

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
}; 