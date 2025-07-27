import { Request, Response } from "express";
import { getUserId } from "../../auth.ts";
import { scheduler } from "../../scheduler.ts";
import { db } from "../../db/connection.ts";
import { boards, type InsertBoard } from "../../db/schema.ts";

export const createBoardController = async (req: Request, res: Response) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Board name is required" });
      return;
    }

    // Create a room/session for this board
    const roomId = Math.random().toString(36).slice(2);
    await scheduler.createRoom(roomId);

    const newBoard: InsertBoard = {
      name: name.trim(),
      userId: userId, // Associate board with the creating user
      data: { shapes: [], cursors: [] },
      hathoraRoomId: roomId
    };

    const [createdBoard] = await db.insert(boards).values(newBoard).returning();
    console.log(
      `Board ${createdBoard.id} created by user ${userId} with room ${roomId}`
    );

    res.json(createdBoard);
  } catch (error) {
    console.error("Failed to create board:", error);
    res.status(500).json({ error: "Failed to create board" });
  }
}; 