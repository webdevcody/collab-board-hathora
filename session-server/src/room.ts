import { type WebSocket } from "ws";
import { boardApiClient, type BoardData } from "./api-client.ts";

const MAX_USERS = 100;
const MAX_SHAPES = 1000;
const PERSIST_DEBOUNCE_MS = 2000; // 2 seconds debounce

type CursorPosition = {
  userId: string;
  x: number;
  y: number;
  timestamp: Date;
};

type ShapeType = "rectangle" | "oval" | "text" | "line" | "arrow";

type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  userId: string; // who created it
  timestamp: Date;
  // Shape-specific data
  text?: string; // for text shapes
  fill?: string;
  stroke?: string;
  rotation?: number; // rotation angle in degrees
};

type BoardSessionData = {
  connectedUsers: string[];
  cursors: CursorPosition[];
  shapes: Shape[];
};

export class Room {
  private clients: Map<string, WebSocket> = new Map();
  private cursors: Map<string, CursorPosition> = new Map();
  private shapes: Map<string, Shape> = new Map();
  private persistTimeout: NodeJS.Timeout | null = null;
  private roomId: string;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.loadInitialBoardState();
  }

  join(userId: string, ws: WebSocket) {
    if (this.clients.size >= MAX_USERS) {
      ws.close(1008, "Room is full");
      return;
    }
    if (this.clients.has(userId)) {
      ws.close(1008, "Duplicate user");
      return;
    }
    this.clients.set(userId, ws);
    this.broadcastSnapshot();
  }

  leave(userId: string) {
    this.clients.delete(userId);
    this.cursors.delete(userId); // Remove cursor when user leaves
    this.broadcastSnapshot();
  }

  handleCursorMove(userId: string, x: number, y: number) {
    // Only update if user is connected
    if (this.clients.has(userId)) {
      this.cursors.set(userId, { userId, x, y, timestamp: new Date() });
      this.broadcastSnapshot();
      // Note: We don't persist cursor movements
    }
  }

  handleShapeCreate(
    userId: string,
    shape: Omit<Shape, "id" | "userId" | "timestamp">
  ) {
    if (this.shapes.size >= MAX_SHAPES) {
      return; // Too many shapes
    }

    if (!this.clients.has(userId)) {
      return; // User not connected
    }

    const newShape: Shape = {
      ...shape,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      userId,
      timestamp: new Date()
    };

    this.shapes.set(newShape.id, newShape);
    this.broadcastSnapshot();
    this.schedulePersistence();
  }

  handleShapeUpdate(userId: string, shapeId: string, updates: Partial<Shape>) {
    const shape = this.shapes.get(shapeId);
    if (shape && this.clients.has(userId)) {
      // Only allow updates from the creator or allow collaborative editing
      this.shapes.set(shapeId, { ...shape, ...updates, timestamp: new Date() });
      this.broadcastSnapshot();
      this.schedulePersistence();
    }
  }

  handleShapeDelete(userId: string, shapeId: string) {
    const shape = this.shapes.get(shapeId);
    if (shape && this.clients.has(userId)) {
      // Only allow deletion from the creator or allow collaborative editing
      this.shapes.delete(shapeId);
      this.broadcastSnapshot();
      this.schedulePersistence();
    }
  }

  getRoomId(): string {
    return this.roomId;
  }

  isEmpty(): boolean {
    return this.clients.size === 0;
  }

  cleanup() {
    // Ensure final persistence before cleanup
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
      this.persistBoardState();
    }
  }

  private async loadInitialBoardState() {
    try {
      const board = await boardApiClient.getBoardByRoomId(this.roomId);

      if (!board) {
        console.log(
          `No existing board found for room ${this.roomId}, starting fresh`
        );
        return;
      }

      if (board.data && board.data.shapes) {
        // Load existing shapes into memory
        board.data.shapes.forEach(shapeData => {
          const shape: Shape = {
            ...shapeData,
            timestamp: new Date(shapeData.timestamp)
          };
          this.shapes.set(shape.id, shape);
        });

        console.log(
          `Loaded ${this.shapes.size} shapes for room ${this.roomId}`
        );
      }
    } catch (error) {
      console.error(
        `Error loading initial board state for room ${this.roomId}:`,
        error
      );
    }
  }

  private schedulePersistence() {
    // Clear existing timeout
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
    }

    // Schedule new persistence
    this.persistTimeout = setTimeout(() => {
      this.persistBoardState();
    }, PERSIST_DEBOUNCE_MS);
  }

  private async persistBoardState() {
    try {
      // Get board info by room ID
      const board = await boardApiClient.getBoardByRoomId(this.roomId);

      if (!board) {
        console.error(`Failed to get board info for room ${this.roomId}`);
        return;
      }

      // Prepare data for persistence (shapes only, no cursors)
      const boardData: BoardData = {
        shapes: Array.from(this.shapes.values()).map(shape => ({
          ...shape,
          timestamp: shape.timestamp.toISOString()
        })),
        cursors: [] // Don't persist cursors
      };

      // Update board data
      await boardApiClient.updateBoardData(board.id, boardData);

      console.log(`Board state persisted for room ${this.roomId}`);
    } catch (error) {
      console.error(
        `Error persisting board state for room ${this.roomId}:`,
        error
      );
    }
  }

  snapshot(): BoardSessionData {
    return {
      connectedUsers: [...this.clients.keys()],
      cursors: [...this.cursors.values()],
      shapes: [...this.shapes.values()]
    };
  }

  private broadcastSnapshot() {
    const snapshot = this.snapshot();
    const snapshotString = JSON.stringify(snapshot);

    this.clients.forEach(client => {
      client.send(snapshotString);
    });
  }
}
