import { getOrStartSession } from "./backendClient";

export async function connect(
  roomId: string,
  token: string,
  onMessage: (event: MessageEvent) => void,
  retries = 2,
): Promise<WebSocket | null> {
  const res = await getOrStartSession(roomId, token);
  if (res == null) {
    return null;
  }
  const { sessionUrl, sessionToken } = res;
  const scheme = sessionUrl.includes("localhost:") ? "ws" : "wss";
  const socket = new WebSocket(`${scheme}://${sessionUrl}?token=${sessionToken}`);
  socket.onmessage = (event) => onMessage(event);
  return new Promise<WebSocket | null>((resolve) => {
    socket.onopen = () => {
      resolve(socket);
    };
    socket.onerror = async () => {
      if (retries > 0) {
        console.log("Retrying connection...");
        await new Promise((r) => setTimeout(r, 250));
        resolve(connect(roomId, token, onMessage, retries - 1));
      } else {
        resolve(null);
      }
    };
  });
}
