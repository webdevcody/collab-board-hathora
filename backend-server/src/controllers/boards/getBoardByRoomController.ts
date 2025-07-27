import { Request, Response } from "express";
import { getBoardByRoomId } from "../../data-access/boards.ts";

export const getBoardByRoomController = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId;
    const board = await getBoardByRoomId(roomId);

    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    res.json(board);
  } catch (error) {
    console.error("Failed to fetch board by room ID:", error);
    res.status(500).json({ error: "Failed to fetch board" });
  }
}; 