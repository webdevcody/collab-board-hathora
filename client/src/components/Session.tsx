import { useState, useEffect } from "react";
import { useOutletContext, useParams, Link } from "react-router";
import { lookupRoom } from "../backendClient";
import { connect, RoomSessionData } from "../sessionClient";
import hyperlink from '../assets/hyperlink.svg';
import Room from "./Room";

type SessionStatus = "Connecting" | "Connected" | "Disconnected" | "Not Found" | "Error";

export default function Session() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token, userId } = useOutletContext<{ token: string; userId: string }>();
  const [status, setStatus] = useState<SessionStatus>("Connecting");
  const [socket, setSocket] = useState<WebSocket>();
  const [snapshot, setSnapshot] = useState<RoomSessionData>();

  if (roomId == null) {
    console.error("Room ID is not defined");
    return null;
  }

  const connectToRoom = async () => {
    try {
      setStatus("Connecting");
      const sessionInfo = await lookupRoom(roomId, token);
      if (sessionInfo == null) {
        setStatus("Not Found");
        return;
      }
      const socket = await connect(sessionInfo.host, sessionInfo.token, setSnapshot);
      setStatus("Connected");
      setSocket(socket);
      console.log("Connected", roomId);
      socket.onclose = (event) => {
        console.log("Disconnected", roomId, event.code, event.reason);
        setStatus("Disconnected");
      };
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Error");
    }
  };

  useEffect(() => {
    connectToRoom();
  }, [roomId, token]);

  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, [socket]);

  return (
    <div className="session-container">
      <SessionHeader roomId={roomId} />
      <SessionContent userId={userId} status={status} socket={socket} snapshot={snapshot} onReconnect={connectToRoom} />
    </div>
  );
}

function SessionHeader({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <div className="session-header">
      <div className="session-title">
        <h2>Room: {roomId}</h2>
      </div>
      <div className="session-actions">
        <button className="button button-secondary share-button" onClick={handleShareLink}>
          {!copied && <img src={hyperlink} className="button-icon" />}
          {copied ? "✓ Copied!" : "Share Link"}
        </button>
        <Link to="/" className="button button-secondary">
          Back to Lobby
        </Link>
      </div>
    </div>
  );
}

function SessionContent({
  userId,
  status,
  socket,
  snapshot,
  onReconnect,
}: {
  userId: string;
  status: SessionStatus;
  socket: WebSocket | undefined;
  snapshot: RoomSessionData | undefined;
  onReconnect: () => void;
}) {
  return (
    <div className="session-content">
      {status === "Connected" && socket != null && snapshot != null ? (
        <Room
          userId={userId}
          connectionHost={socket.url.split("/")[2]}
          snapshot={snapshot}
          onSend={(msg) => socket.send(msg)}
        />
      ) : (
        <StatusMessage status={status} onReconnect={onReconnect} />
      )}
    </div>
  );
}

function StatusMessage({ status, onReconnect }: { status: SessionStatus; onReconnect: () => void }) {
  if (status === "Not Found") {
    return (
      <>
        <h3>Room Not Found</h3>
        <p>The room you're looking for doesn't exist or has expired.</p>
        <Link to="/" className="status-link">
          Back to Lobby
        </Link>
      </>
    );
  } else if (status === "Error") {
    return (
      <>
        <h3>Connection Error</h3>
        <p>Failed to connect to the chat room. Please try again.</p>
        <div className="status-link" onClick={onReconnect}>
          Try Again
        </div>
      </>
    );
  } else if (status === "Disconnected") {
    return (
      <>
        <h3>Disconnected</h3>
        <p>You have been disconnected from the chat room.</p>
        <div className="status-link" onClick={onReconnect}>
          Reconnect
        </div>
      </>
    );
  } else {
    return (
      <>
        <h3>
          <div className="loading-spinner"></div>
          Connecting to room...
        </h3>
        <p>Please wait while we connect you to the chat room.</p>
      </>
    );
  }
}
