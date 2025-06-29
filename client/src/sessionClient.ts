import { getOrStartSession } from "./backendClient";

export type Message = { userId: string; msg: string; ts: Date };
export type RoomSessionData = {
  messages: Message[];
  connectedUsers: string[];
};

export async function connect<T>(
  roomId: string,
  token: string,
  onMessage: (event: T) => void,
  retries = 2,
): Promise<WebSocket | "Not Found" | "Error"> {
  const res = await getOrStartSession(roomId, token);
  if (res == null) {
    return "Not Found";
  }
  const { sessionUrl, sessionToken } = res;
  const scheme = sessionUrl.includes("localhost:") ? "ws" : "wss";
  const socket = new WebSocket(`${scheme}://${sessionUrl}?token=${sessionToken}`);
  socket.onmessage = (event) => onMessage(JSON.parse(event.data) as T);
  return new Promise<WebSocket | "Not Found" | "Error">((resolve) => {
    socket.onopen = () => {
      resolve(socket);
    };
    socket.onerror = async () => {
      if (retries > 0) {
        console.log("Retrying connection...");
        await new Promise((r) => setTimeout(r, 250));
        resolve(connect(roomId, token, onMessage, retries - 1));
      } else {
        resolve("Error");
      }
    };
  });
}
