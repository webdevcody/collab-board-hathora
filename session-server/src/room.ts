import { type WebSocket } from "ws";

const MAX_USERS = 100;
const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 1000;

type Message = { userId: string; msg: string; ts: Date };
type RoomSessionData = {
  messages: Message[];
  connectedUsers: string[];
};
export class Room {
  private clients: Map<string, WebSocket> = new Map();
  private messages: Message[] = [];

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
  leave(userId: string, ws: WebSocket) {
    this.clients.delete(userId);
    this.broadcastSnapshot();
  }
  handleMessage(userId: string, msg: string) {
    if (this.messages.length >= MAX_MESSAGES || msg.length > MAX_MESSAGE_LENGTH) {
      return;
    }
    const message = { userId, msg, ts: new Date() };
    this.messages.push(message);
    this.broadcastSnapshot();
  }
  snapshot(): RoomSessionData {
    return {
      messages: this.messages,
      connectedUsers: [...this.clients.keys()],
    };
  }

  private broadcastSnapshot() {
    const snapshot = JSON.stringify(this.snapshot());
    this.clients.forEach((client) => {
      client.send(snapshot);
    });
  }
}
