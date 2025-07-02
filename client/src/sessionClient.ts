export type Message = { userId: string; msg: string; ts: Date };
export type RoomSessionData = {
  messages: Message[];
  connectedUsers: string[];
};

export async function connect<T>(
  sessionHost: string,
  sessionToken: string,
  onMessage: (event: T) => void,
  retries = 2,
): Promise<WebSocket | null> {
  const scheme = sessionHost.includes("localhost:") ? "ws" : "wss";
  const socket = new WebSocket(`${scheme}://${sessionHost}?token=${sessionToken}`);
  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data) as T);
  };
  return new Promise<WebSocket | null>((resolve) => {
    socket.onopen = () => {
      resolve(socket);
    };
    socket.onerror = async () => {
      if (retries > 0) {
        console.log("Retrying connection...");
        await new Promise((r) => setTimeout(r, 250));
        resolve(connect(sessionHost, sessionToken, onMessage, retries - 1));
      } else {
        resolve(null);
      }
    };
  });
}
