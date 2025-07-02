export type Message = { userId: string; msg: string; ts: Date };
export type RoomSessionData = {
  messages: Message[];
  connectedUsers: string[];
};

export async function connect(
  sessionHost: string,
  sessionToken: string,
  onMessage: (event: RoomSessionData) => void,
): Promise<WebSocket> {
  return new Promise<WebSocket>((resolve, reject) => {
    const scheme = sessionHost.includes("localhost:") ? "ws" : "wss";
    const socket = new WebSocket(`${scheme}://${sessionHost}?token=${sessionToken}`);
    socket.onmessage = (event) => {
      onMessage(JSON.parse(event.data) as RoomSessionData);
    };
    socket.onopen = () => {
      resolve(socket);
    };
    socket.onerror = (error) => {
      reject(error);
    };
  });
}
