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

// Auth routes
router.post("/login", loginController);

// Board routes
router.get("/boards", getBoardsController);
router.get("/boards/by-room/:roomId", authMiddleware, getBoardByRoomController);
router.post("/boards", createBoardController);
router.get("/boards/:id", getBoardController);
router.put("/boards/:id", authMiddleware, updateBoardController);
router.delete("/boards/:id", deleteBoardController);

// Room routes
router.post("/rooms", createRoomController);
router.get("/rooms/:roomId", getRoomController);

export default router;
