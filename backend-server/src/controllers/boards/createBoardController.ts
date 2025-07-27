import { Request, Response } from "express";
import { z } from "zod";
import { scheduler } from "../../scheduler.ts";
import { createBoard } from "../../data-access/boards.ts";

const createBoardSchema = z.object({
  name: z.string().min(1, "Board name is required")
});

export const createBoardController = async (req: Request, res: Response) => {
  const validatedData = createBoardSchema.parse(req.body);

  // Create a room/session for this board
  const roomId = Math.random().toString(36).slice(2);
  await scheduler.createRoom(roomId);

  const newBoard = {
    name: validatedData.name.trim(),
    userId: req.userId!, // Associate board with the creating user
    data: { shapes: [], cursors: [] },
    hathoraRoomId: roomId
  };

  const createdBoard = await createBoard(newBoard);
  console.log(
    `Board ${createdBoard.id} created by user ${req.userId} with room ${roomId}`
  );

  res.json(createdBoard);
}; 