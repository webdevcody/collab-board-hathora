import { Request, Response } from "express";
import { getBoardsByUserId } from "../../data-access/boards.ts";

export const getBoardsController = async (req: Request, res: Response) => {
  const userBoards = await getBoardsByUserId(req.userId!);
  res.json(userBoards);
};
