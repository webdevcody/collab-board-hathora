import { type WebSocket } from "ws";

export class Room {
  private clients: Map<string, WebSocket> = new Map();
  private messages: { userId: string; msg: string; ts: Date }[] = [];

  join(userId: string, ws: WebSocket) {
    this.clients.set(userId, ws);
    ws.send(JSON.stringify(this.snapshot()));
  }
  leave(userId: string, ws: WebSocket) {
    this.clients.delete(userId);
  }
  handleMessage(userId: string, msg: string) {
    const message = { userId, msg, ts: new Date() };
    this.messages.push(message);
    const snapshot = JSON.stringify(this.snapshot());
    this.clients.forEach((client) => {
      client.send(snapshot);
    });
  }
  snapshot() {
    return { messages: this.messages };
  }
}
