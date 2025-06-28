import { type WebSocket } from "ws";

type Message = { userId: string; msg: string; ts: Date };
type RoomSessionData = {
  messages: Message[];
  connectedUsers: string[];
};
export class Room {
  private clients: Map<string, WebSocket> = new Map();
  private messages: Message[] = [];

  join(userId: string, ws: WebSocket) {
    this.clients.set(userId, ws);
    this.broadcastSnapshot();
  }
  leave(userId: string, ws: WebSocket) {
    this.clients.delete(userId);
    this.broadcastSnapshot();
  }
  handleMessage(userId: string, msg: string) {
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
