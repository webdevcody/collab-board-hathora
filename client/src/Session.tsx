import { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router";
import { getOrStartSession } from "./backendClient";
import Room, { RoomSessionData } from "./Room";

export default function Session() {
  const { roomId } = useParams();
  const { token } = useOutletContext<{ token: string; userId: string }>();
  const [socket, setSocket] = useState<WebSocket>();
  const [status, setStatus] = useState<"Connecting" | "Connected" | "Disconnected" | "Not Found" | "Error">(
    "Connecting",
  );
  const [snapshot, setSnapshot] = useState<RoomSessionData>();

  useEffect(() => {
    if (roomId != null) {
      connect(roomId, token, (event) => {
        const snapshot = JSON.parse(event.data);
        setSnapshot(snapshot);
        console.log("Received snapshot:", snapshot);
      })
        .then((socket) => {
          if (socket != null) {
            setSocket(socket);
            setStatus("Connected");
            socket.onclose = (event) => {
              console.log("Disconnected:", event.code, event.reason);
              setStatus("Disconnected");
            };
          } else {
            setStatus("Not Found");
          }
        })
        .catch((err) => {
          console.error("Failed to connect:", err);
          setStatus("Error");
        });
    }

    return () => {
      socket?.close();
    };
  }, [roomId, token]);

  return (
    <div className="session-container">
      <div className="session-header">
        <h2>Room: {roomId}</h2>
      </div>
      <div className="session-content">
        {status === "Connected" && socket != null && snapshot != null ? (
          <Room socket={socket} snapshot={snapshot} />
        ) : status === "Not Found" ? (
          <>
            <h3>Room Not Found</h3>
            <p>The room you're looking for doesn't exist or has expired.</p>
          </>
        ) : status === "Error" ? (
          <>
            <h3>Connection Error</h3>
            <p>Failed to connect to the chat room. Please try again.</p>
          </>
        ) : status === "Disconnected" ? (
          <>
            <h3>Disconnected</h3>
            <p>You have been disconnected from the chat room.</p>
          </>
        ) : (
          <>
            <h3>Connecting to room...</h3>
            <p>Please wait while we connect you to the chat room.</p>
          </>
        )}
      </div>
    </div>
  );
}

async function connect(roomId: string, token: string, onMessage: (event: MessageEvent) => void, retries = 2) {
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
