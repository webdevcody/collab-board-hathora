export type CursorPosition = {
  userId: string;
  x: number;
  y: number;
  timestamp: Date;
};

export type ShapeType = "rectangle" | "oval" | "text" | "line" | "arrow";

export type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  userId: string;
  timestamp: Date;
  text?: string;
  fill?: string;
  stroke?: string;
  rotation?: number; // rotation angle in degrees
};

export type BoardSessionData = {
  connectedUsers: string[];
  cursors: CursorPosition[];
  shapes: Shape[];
};

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
    this.socket.send(JSON.stringify({ type: "cursor_move", x, y }));
  }
  public sendShapeCreate(
    shapeType: ShapeType,
    x: number,
    y: number,
    width: number,
    height: number,
    options: { text?: string; fill?: string; stroke?: string } = {}
  ): void {
    const message = {
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
    this.socket.send(
      JSON.stringify({
        type: "shape_update",
        shapeId,
        ...updates
      })
    );
  }
  public sendShapeDelete(shapeId: string): void {
    this.socket.send(
      JSON.stringify({
        type: "shape_delete",
        shapeId
      })
    );
  }
  public onClose(callback: () => void): void {
    this.socket.onclose = callback;
  }
  public close(): void {
    this.socket.close();
  }
}
