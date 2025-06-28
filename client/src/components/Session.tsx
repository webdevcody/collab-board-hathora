import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router";
import { connect } from "../session";
import Room, { RoomSessionData } from "./Room";
import "../styles/session.css";

type SessionStatus = "Connecting" | "Connected" | "Disconnected" | "Not Found" | "Error";

export default function Session() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { token } = useOutletContext<{ token: string; userId: string }>();
  const [socket, setSocket] = useState<WebSocket>();
  const [status, setStatus] = useState<SessionStatus>("Connecting");
  const [snapshot, setSnapshot] = useState<RoomSessionData>();

  const connectToRoom = async () => {
    if (roomId == null) {
      return;
    }
    const socket = await connect(roomId, token, (event) => {
      const snapshot = JSON.parse(event.data);
      setSnapshot(snapshot);
      console.log("Received snapshot:", snapshot);
    });
    if (socket === "Not Found" || socket === "Error") {
      setStatus(socket);
      return;
    }
    setSocket(socket);
    setStatus("Connected");
    socket.onclose = (event) => {
      console.log("Disconnected:", event.code, event.reason);
      setStatus("Disconnected");
    };
  };

  useEffect(() => {
    connectToRoom().catch((error) => {
      console.error("Connection error:", error);
      setStatus("Error");
    });
    return () => {
      socket?.close();
    };
  }, [roomId, token]);

  return (
    <div className="session-container">
      <SessionHeader roomId={roomId} onBackToLobby={() => navigate("/")} />
      <SessionContent status={status} socket={socket} snapshot={snapshot} />
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
  status,
  socket,
  snapshot,
}: {
  status: SessionStatus;
  socket: WebSocket | undefined;
  snapshot: RoomSessionData | undefined;
}) {
  return (
    <div className="session-content">
      {socket != null && snapshot != null ? (
        <Room socket={socket} snapshot={snapshot} />
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
