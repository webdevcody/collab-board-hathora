export type CursorPosition = {
  userId: string;
  x: number;
  y: number;
  timestamp: Date;
};

export type ShapeType = "rectangle" | "oval" | "text";

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
};

export type BoardSessionData = {
  connectedUsers: string[];
  cursors: CursorPosition[];
  shapes: Shape[];
};

export async function connect(
  sessionHost: string,
  sessionToken: string,
  onMessage: (event: BoardSessionData) => void
): Promise<WebSocket> {
  return new Promise<WebSocket>((resolve, reject) => {
    const scheme = import.meta.env.DEV ? "ws" : "wss";
    const socket = new WebSocket(
      `${scheme}://${sessionHost}/?token=${sessionToken}`
    );
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as BoardSessionData;
      onMessage(data);
    };
    socket.onopen = () => {
      resolve(socket);
    };
    socket.onerror = (error) => {
      reject(error);
    };
  });
}

export function sendCursorMove(socket: WebSocket, x: number, y: number) {
  socket.send(
    JSON.stringify({
      type: "cursor_move",
      x,
      y,
    })
  );
}

export function sendShapeCreate(
  socket: WebSocket,
  shapeType: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { text?: string; fill?: string; stroke?: string } = {}
) {
  const message = {
    type: "shape_create",
    shapeType,
    x,
    y,
    width,
    height,
    text: options.text,
    fill: options.fill || "#3b82f6",
    stroke: options.stroke || "#1d4ed8",
  };

  socket.send(JSON.stringify(message));
}

export function sendShapeUpdate(
  socket: WebSocket,
  shapeId: string,
  updates: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    fill?: string;
    stroke?: string;
  }
) {
  socket.send(
    JSON.stringify({
      type: "shape_update",
      shapeId,
      ...updates,
    })
  );
}

export function sendShapeDelete(socket: WebSocket, shapeId: string) {
  socket.send(
    JSON.stringify({
      type: "shape_delete",
      shapeId,
    })
  );
}
