import type {
  ShapeType,
  BoardSessionData,
  CursorMoveMessage,
  ShapeCreateMessage,
  ShapeUpdateMessage,
  ShapeDeleteMessage
} from "../../session-server/src/types";

export class SessionClient {
  private socket: WebSocket | null = null;
  public host: string;
  private messageCallback: ((data: BoardSessionData) => void) | null = null;
  private closeCallback: (() => void) | null = null;

  constructor(host: string) {
    this.host = host;
  }

  public static create(host: string): SessionClient {
    return new SessionClient(host);
  }

  public async connect(
    token: string,
    timeoutMs: number = 30000
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const scheme = import.meta.env.DEV ? "ws" : "wss";
      this.socket = new WebSocket(`${scheme}://${this.host}/?token=${token}`);

      // Set up timeout for connection
      const timeout = setTimeout(() => {
        if (this.socket?.readyState === WebSocket.CONNECTING) {
          this.socket.close();
          reject(
            new Error(`WebSocket connection timeout after ${timeoutMs}ms`)
          );
        }
      }, timeoutMs);

      this.socket.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.socket.onerror = error => {
        clearTimeout(timeout);
        reject(error);
      };

      this.socket.onclose = () => {
        clearTimeout(timeout);
        if (this.closeCallback) {
          this.closeCallback();
        }
      };

      // Set up message handler if callback was already registered
      if (this.messageCallback) {
        this.socket.onmessage = event => {
          this.messageCallback!(JSON.parse(event.data) as BoardSessionData);
        };
      }
    });
  }

  public onMessage(callback: (data: BoardSessionData) => void): void {
    this.messageCallback = callback;
    if (this.socket) {
      this.socket.onmessage = event => {
        callback(JSON.parse(event.data) as BoardSessionData);
      };
    }
  }

  public sendCursorMove(x: number, y: number): void {
    if (!this.socket) {
      console.warn("Cannot send message: socket not connected");
      return;
    }
    const message: CursorMoveMessage = { type: "cursor_move", x, y };
    this.socket.send(JSON.stringify(message));
  }

  public sendShapeCreate(
    shapeType: ShapeType,
    x: number,
    y: number,
    width: number,
    height: number,
    options: { text?: string; fill?: string; stroke?: string } = {}
  ): void {
    if (!this.socket) {
      console.warn("Cannot send message: socket not connected");
      return;
    }
    const message: ShapeCreateMessage = {
      type: "shape_create",
      shapeType,
      x,
      y,
      width,
      height,
      text: options.text,
      fill: options.fill || "#3b82f6",
      stroke: options.stroke || "#1d4ed8"
    };
    this.socket.send(JSON.stringify(message));
  }

  public sendShapeUpdate(
    shapeId: string,
    updates: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      text?: string;
      fill?: string;
      stroke?: string;
      rotation?: number;
    }
  ): void {
    if (!this.socket) {
      console.warn("Cannot send message: socket not connected");
      return;
    }
    const message: ShapeUpdateMessage = {
      type: "shape_update",
      shapeId,
      ...updates
    };
    this.socket.send(JSON.stringify(message));
  }

  public sendShapeDelete(shapeId: string): void {
    if (!this.socket) {
      console.warn("Cannot send message: socket not connected");
      return;
    }
    const message: ShapeDeleteMessage = { type: "shape_delete", shapeId };
    this.socket.send(JSON.stringify(message));
  }

  public onClose(callback: () => void): void {
    this.closeCallback = callback;
    if (this.socket) {
      this.socket.onclose = callback;
    }
  }

  public close(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
