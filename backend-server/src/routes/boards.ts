import { Router } from "express";
import { getUserId, authMiddleware } from "../auth.ts";
import { scheduler } from "../scheduler.ts";
import { db } from "../db/connection.ts";
import { boards, type InsertBoard } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const router = Router();

// Get all boards for the authenticated user
router.get("/", async (req, res) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const userBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, userId));
    res.json(userBoards);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
});

// Get board info by roomId (hathoraRoomId)
router.get("/by-room/:roomId", authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.hathoraRoomId, roomId));

    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    res.json(board);
  } catch (error) {
    console.error("Failed to fetch board by room ID:", error);
    res.status(500).json({ error: "Failed to fetch board" });
  }
});

// Create a new board
router.post("/", async (req, res) => {
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
    const roomId = await scheduler.createRoom();

    const newBoard: InsertBoard = {
      name: name.trim(),
      userId: userId, // Associate board with the creating user
      data: { shapes: [], cursors: [] },
      hathoraRoomId: roomId,
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
});

// Get a specific board
router.get("/:id", async (req, res) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ error: "Invalid board ID" });
      return;
    }

    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));
    if (!board) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    res.json(board);
  } catch (error) {
    console.error("Failed to fetch board:", error);
    res.status(500).json({ error: "Failed to fetch board" });
  }
});

// Update a board's data
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ error: "Invalid board ID" });
      return;
    }

    // Check if the board exists
    const [existingBoard] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));

    if (!existingBoard) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    // Only check ownership for client requests, not session server requests
    if (!req.isSessionServer && existingBoard.userId !== req.userId) {
      res
        .status(403)
        .json({ error: "You don't have permission to update this board" });
      return;
    }

    const { name, data } = req.body;
    const updates: Partial<InsertBoard> = {};

    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400).json({ error: "Board name must be a string" });
        return;
      }
      updates.name = name.trim();
    }

    if (data !== undefined) {
      updates.data = data;
    }

    const [updatedBoard] = await db
      .update(boards)
      .set(updates)
      .where(eq(boards.id, boardId))
      .returning();

    res.json(updatedBoard);
  } catch (error) {
    console.error("Failed to update board:", error);
    res.status(500).json({ error: "Failed to update board" });
  }
});

// Delete a board
router.delete("/:id", async (req, res) => {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }

  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ error: "Invalid board ID" });
      return;
    }

    // Check if the board belongs to the user
    const [existingBoard] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));

    if (!existingBoard) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (existingBoard.userId !== userId) {
      res
        .status(403)
        .json({ error: "You don't have permission to delete this board" });
      return;
    }

    const [deletedBoard] = await db
      .delete(boards)
      .where(eq(boards.id, boardId))
      .returning();

    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Failed to delete board:", error);
    res.status(500).json({ error: "Failed to delete board" });
  }
});

export default router;
