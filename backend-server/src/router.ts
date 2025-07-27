import { Router } from "express";
import { loginController } from "./controllers/auth/loginController";
import { authMiddleware } from "./auth.ts";

// Board controllers
import { getBoardsController } from "./controllers/boards/getBoardsController";
import { getBoardByRoomController } from "./controllers/boards/getBoardByRoomController";
import { createBoardController } from "./controllers/boards/createBoardController";
import { getBoardController } from "./controllers/boards/getBoardController";
import { updateBoardController } from "./controllers/boards/updateBoardController";
import { deleteBoardController } from "./controllers/boards/deleteBoardController";

// Room controllers
import { createRoomController } from "./controllers/rooms/createRoomController";
import { getRoomController } from "./controllers/rooms/getRoomController";

const router = Router();

// Auth routes (no auth required)
router.post("/login", loginController);

// Board routes (auth required)
router.get("/boards", authMiddleware, getBoardsController);
router.get("/boards/by-room/:roomId", authMiddleware, getBoardByRoomController);
router.post("/boards", authMiddleware, createBoardController);
router.get("/boards/:id", authMiddleware, getBoardController);
router.put("/boards/:id", authMiddleware, updateBoardController);
router.delete("/boards/:id", authMiddleware, deleteBoardController);

// Room routes (auth required)
router.post("/rooms", authMiddleware, createRoomController);
router.get("/rooms/:roomId", authMiddleware, getRoomController);

export default router;
