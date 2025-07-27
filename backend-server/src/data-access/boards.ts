import { db } from "../db/connection.ts";
import { boards, type InsertBoard } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export const getBoardsByUserId = async (userId: string) => {
  return await db
    .select()
    .from(boards)
    .where(eq(boards.userId, userId));
};

export const getBoardById = async (boardId: number) => {
  const [board] = await db
    .select()
    .from(boards)
    .where(eq(boards.id, boardId));
  
  return board || null;
};

export const getBoardByRoomId = async (roomId: string) => {
  const [board] = await db
    .select()
    .from(boards)
    .where(eq(boards.hathoraRoomId, roomId));
  
  return board || null;
};

export const createBoard = async (boardData: InsertBoard) => {
  const [newBoard] = await db.insert(boards).values(boardData).returning();
  return newBoard;
};

export const updateBoard = async (boardId: number, updates: Partial<InsertBoard>) => {
  const [updatedBoard] = await db
    .update(boards)
    .set(updates)
    .where(eq(boards.id, boardId))
    .returning();
  
  return updatedBoard;
};

export const deleteBoard = async (boardId: number) => {
  const [deletedBoard] = await db
    .delete(boards)
    .where(eq(boards.id, boardId))
    .returning();
  
  return deletedBoard;
}; 