import { type WebSocket } from "ws";

const MAX_USERS = 100;
const MAX_SHAPES = 1000;

type CursorPosition = {
  userId: string;
  x: number;
  y: number;
  timestamp: Date;
};

type ShapeType = "rectangle" | "oval" | "text" | "line";

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
      timestamp: new Date(),
    };

    this.shapes.set(newShape.id, newShape);
    this.broadcastSnapshot();
  }

  handleShapeUpdate(userId: string, shapeId: string, updates: Partial<Shape>) {
    const shape = this.shapes.get(shapeId);
    if (shape && this.clients.has(userId)) {
      // Only allow updates from the creator or allow collaborative editing
      this.shapes.set(shapeId, { ...shape, ...updates, timestamp: new Date() });
      this.broadcastSnapshot();
    }
  }

  handleShapeDelete(userId: string, shapeId: string) {
    const shape = this.shapes.get(shapeId);
    if (shape && this.clients.has(userId)) {
      // Only allow deletion from the creator or allow collaborative editing
      this.shapes.delete(shapeId);
      this.broadcastSnapshot();
    }
  }

  snapshot(): BoardSessionData {
    return {
      connectedUsers: [...this.clients.keys()],
      cursors: [...this.cursors.values()],
      shapes: [...this.shapes.values()],
    };
  }

  private broadcastSnapshot() {
    const snapshot = this.snapshot();
    const snapshotString = JSON.stringify(snapshot);

    this.clients.forEach((client) => {
      client.send(snapshotString);
    });
  }
}
