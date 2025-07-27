import { Request, Response } from "express";
import { getUserId } from "../../auth.ts";
import { scheduler } from "../../scheduler.ts";
import { createBoard } from "../../data-access/boards.ts";

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
    const newBoard = {
      name: `Board ${Date.now()}`, // Generate a default name
      userId: userId, // Associate board with the creating user
      data: { shapes: [], cursors: [] },
      hathoraRoomId: roomId
    };

    const createdBoard = await createBoard(newBoard);
    console.log(
      `Room ${roomId} created by user ${userId} with board ${createdBoard.id}`
    );

    res.json({ roomId, boardId: createdBoard.id });
  } catch (error) {
    console.error("Failed to create room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
}; 