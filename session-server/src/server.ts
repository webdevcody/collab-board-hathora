import http from "node:http";
import { WebSocketServer } from "ws";
import { verifyToken } from "./auth.ts";
import { Room } from "./room.ts";

const httpServer = http.createServer();
const wss = new WebSocketServer({ noServer: true });
const rooms: Record<string, Room> = {};

httpServer.on("upgrade", async (req, socket, head) => {
  const token = req.url?.split("token=").at(1);
  const payload = verifyToken<{ userId: string; roomId: string; host: string }>(token);
  if (payload == null || payload.host !== req.headers.host) {
    console.log("Invalid token", token);
    return socket.destroy();
  }
  const { userId, roomId } = payload;
  const room = await getOrLoadRoom(roomId);
  wss.handleUpgrade(req, socket, head, (ws) => {
    console.log(`User ${userId} connected to room ${roomId}`);
    room.join(userId, ws);
    ws.on("message", (msg) => {
      room.handleMessage(userId, msg.toString());
    });
    ws.on("close", () => {
      console.log(`User ${userId} disconnected from room ${roomId}`);
      room.leave(userId);
    });
  });
});

async function getOrLoadRoom(roomId: string): Promise<Room> {
  const room = rooms[roomId] ?? new Room();
  rooms[roomId] = room;
  return room;
}

const port = process.env.PORT ?? 8000;
httpServer.listen(port).once("listening", () => {
  console.log(`Listening on *:${port}`);
});
