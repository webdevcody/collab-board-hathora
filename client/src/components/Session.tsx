import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router";
import { connect, RoomSessionData } from "../sessionClient";
import Room from "./Room";
import "../styles/session.css";

type SessionStatus = "Connecting" | "Connected" | "Disconnected" | "Not Found" | "Error";

export default function Session() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { token, userId } = useOutletContext<{ token: string; userId: string }>();
  const [status, setStatus] = useState<SessionStatus>("Connecting");
  const [socket, setSocket] = useState<WebSocket>();
  const [snapshot, setSnapshot] = useState<RoomSessionData>();

  if (roomId == null) {
    console.error("Room ID is not defined");
    return null;
  }

  const connectToRoom = async () => {
    const socket = await connect<RoomSessionData>(roomId, token, setSnapshot);
    if (socket === "Not Found" || socket === "Error") {
      setStatus(socket);
      return;
    }
    setSocket(socket);
    setStatus("Connected");
    console.log("Connected", roomId);
    socket.onclose = (event) => {
      console.log("Disconnected", roomId, event.code, event.reason);
      setStatus("Disconnected");
    };
  };

  useEffect(() => {
    connectToRoom().catch((error) => {
      console.error("Connection error:", error);
      setStatus("Error");
    });
  }, [roomId, token]);

  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, [socket]);

  return (
    <div className="session-container">
      <SessionHeader roomId={roomId} onBackToLobby={() => navigate("/")} />
      <SessionContent userId={userId} status={status} socket={socket} snapshot={snapshot} />
    </div>
  );
}

function SessionHeader({ roomId, onBackToLobby }: { roomId: string | undefined; onBackToLobby: () => void }) {
  return (
    <div className="session-header">
      <div className="session-title">
        <h2>Room: {roomId}</h2>
      </div>
      <button className="button button-secondary" onClick={onBackToLobby}>
        Back to Lobby
      </button>
    </div>
  );
}

function SessionContent({
  userId,
  status,
  socket,
  snapshot,
}: {
  userId: string;
  status: SessionStatus;
  socket: WebSocket | undefined;
  snapshot: RoomSessionData | undefined;
}) {
  return (
    <div className="session-content">
      {status === "Connected" && socket != null && snapshot != null ? (
        <Room userId={userId} snapshot={snapshot} onSend={(msg) => socket.send(msg)} />
      ) : (
        <StatusMessage status={status} />
      )}
    </div>
  );
}

function StatusMessage({ status }: { status: SessionStatus }) {
  if (status === "Not Found") {
    return (
      <>
        <h3>Room Not Found</h3>
        <p>The room you're looking for doesn't exist or has expired.</p>
      </>
    );
  } else if (status === "Error") {
    return (
      <>
        <h3>Connection Error</h3>
        <p>Failed to connect to the chat room. Please try again.</p>
      </>
    );
  } else if (status === "Disconnected") {
    return (
      <>
        <h3>Disconnected</h3>
        <p>You have been disconnected from the chat room.</p>
      </>
    );
  } else {
    return (
      <>
        <h3>Connecting to room...</h3>
        <p>Please wait while we connect you to the chat room.</p>
      </>
    );
  }
}
