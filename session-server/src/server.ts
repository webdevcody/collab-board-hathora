import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyToken } from "./auth.ts";
import { Room } from "./room.ts";

const httpServer = http.createServer((req, res) => res.writeHead(200).end());
const wss = new WebSocketServer({ noServer: true });
const rooms: Record<string, Room> = {};

httpServer.on("upgrade", async (req, socket, head) => {
  const token = req.url?.split("?token=").at(1);
  const payload = verifyToken<{ userId: string; roomId: string }>(token);
  if (payload == null) {
    console.log("Invalid token", token);
    return socket.destroy();
  }
  const room = await getOrLoadRoom(payload.roomId);
  wss.handleUpgrade(req, socket, head, (ws) => {
    handleConnection(ws, payload.userId, payload.roomId, room);
  });
});

function handleConnection(ws: WebSocket, userId: string, roomId: string, room: Room) {
  console.log(`User ${userId} connected to room ${roomId}`);
  room.join(userId, ws);
  ws.on("message", (msg) => {
    room.handleMessage(userId, msg.toString());
  });
  ws.on("close", () => {
    console.log(`User ${userId} disconnected from room ${roomId}`);
    room.leave(userId, ws);
  });
}

async function getOrLoadRoom(roomId: string): Promise<Room> {
  const room = rooms[roomId] ?? new Room();
  rooms[roomId] = room;
  return room;
}

const port = process.env.PORT ?? 8000;
httpServer.listen(port).once("listening", () => {
  console.log(`Listening on *:${port}`);
});
