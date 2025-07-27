import { Request, Response } from "express";
import { scheduler } from "../../scheduler.ts";
import { createBoard } from "../../data-access/boards.ts";

export const createRoomController = async (req: Request, res: Response) => {
  // Create a room/session
  const roomId = Math.random().toString(36).slice(2);
  await scheduler.createRoom(roomId);

  // Create a corresponding board
  const newBoard = {
    name: `Board ${Date.now()}`, // Generate a default name
    userId: req.userId!, // Associate board with the creating user
    data: { shapes: [], cursors: [] },
    hathoraRoomId: roomId
  };

  const createdBoard = await createBoard(newBoard);
  console.log(
    `Room ${roomId} created by user ${req.userId} with board ${createdBoard.id}`
  );

  res.json({ roomId, boardId: createdBoard.id });
}; 