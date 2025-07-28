import type {
  ShapeType,
  BoardSessionData,
  CursorMoveMessage,
  ShapeCreateMessage,
  ShapeUpdateMessage,
  ShapeDeleteMessage
} from "../../session-server/src/types";

export class SessionClient {
  private socket: WebSocket;
  public host: string;
  private constructor(socket: WebSocket, host: string) {
    this.socket = socket;
    this.host = host;
  }
  public static async connect(
    host: string,
    token: string
  ): Promise<SessionClient> {
    return new Promise<SessionClient>((resolve, reject) => {
      const scheme = import.meta.env.DEV ? "ws" : "wss";
      const socket = new WebSocket(`${scheme}://${host}/?token=${token}`);
      socket.onopen = () => {
        resolve(new SessionClient(socket, host));
      };
      socket.onerror = error => {
        reject(error);
      };
    });
  }
  public onMessage(callback: (data: BoardSessionData) => void): void {
    this.socket.onmessage = event => {
      callback(JSON.parse(event.data) as BoardSessionData);
    };
  }
  public sendCursorMove(x: number, y: number): void {
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
    const message: ShapeUpdateMessage = {
      type: "shape_update",
      shapeId,
      ...updates
    };
    this.socket.send(JSON.stringify(message));
  }

  public sendShapeDelete(shapeId: string): void {
    const message: ShapeDeleteMessage = { type: "shape_delete", shapeId };
    this.socket.send(JSON.stringify(message));
  }
  public onClose(callback: () => void): void {
    this.socket.onclose = callback;
  }
  public close(): void {
    this.socket.close();
  }
}
