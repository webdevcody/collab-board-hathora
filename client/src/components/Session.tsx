import { useState, useEffect } from "react";
import { useOutletContext, useParams, Link } from "react-router";
import { lookupRoom, getBoardByRoomId } from "../backendClient";
import { connect, BoardSessionData } from "../sessionClient";
import hyperlink from "../assets/hyperlink.svg";
import Board from "./Board";

type SessionStatus =
  | "Connecting"
  | "Connected"
  | "Disconnected"
  | "Not Found"
  | "Error";

interface BoardInfo {
  id: number;
  name: string;
  userId: string;
  data: any;
  hathoraRoomId: string;
  createdAt: string;
  updatedAt: string;
}

export default function Session() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token, userId } = useOutletContext<{
    token: string;
    userId: string;
  }>();
  const [status, setStatus] = useState<SessionStatus>("Connecting");
  const [socket, setSocket] = useState<WebSocket>();
  const [snapshot, setSnapshot] = useState<BoardSessionData>();
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);

  if (roomId == null) {
    throw new Error("Room ID is missing");
  }

  const connectToRoom = async () => {
    try {
      setStatus("Connecting");

      // Fetch board info first
      try {
        const board = await getBoardByRoomId(roomId, token);
        setBoardInfo(board);
      } catch (error) {
        console.error("Failed to fetch board info:", error);
        // Continue without board info if this fails
      }

      const sessionInfo = await lookupRoom(roomId, token);
      if (sessionInfo.host == null || sessionInfo.token == null) {
        setStatus("Not Found");
        return;
      }
      const socket = await connect(
        sessionInfo.host,
        sessionInfo.token,
        setSnapshot
      );
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
      <SessionHeader roomId={roomId} boardInfo={boardInfo} />
      <SessionContent
        userId={userId}
        status={status}
        socket={socket}
        snapshot={snapshot}
        boardInfo={boardInfo}
        onReconnect={connectToRoom}
      />
    </div>
  );
}

function SessionHeader({
  roomId,
  boardInfo,
}: {
  roomId: string;
  boardInfo: BoardInfo | null;
}) {
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
        <h2>{boardInfo?.name || `Board: ${roomId}`}</h2>
      </div>
      <div className="session-actions">
        <button
          className="button button-secondary share-button"
          onClick={handleShareLink}
        >
          {!copied && <img src={hyperlink} className="button-icon" />}
          {copied ? "✓ Copied!" : "Share Link"}
        </button>
        <Link to="/dashboard" className="button button-secondary">
          Back to Dashboard
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
  boardInfo,
  onReconnect,
}: {
  userId: string;
  status: SessionStatus;
  socket: WebSocket | undefined;
  snapshot: BoardSessionData | undefined;
  boardInfo: BoardInfo | null;
  onReconnect: () => void;
}) {
  return (
    <div className="session-content">
      {status === "Connected" && socket != null && snapshot != null ? (
        <Board
          userId={userId}
          connectionHost={socket.url.split("/")[2]}
          snapshot={snapshot}
          socket={socket}
          boardInfo={boardInfo}
        />
      ) : (
        <StatusMessage status={status} onReconnect={onReconnect} />
      )}
    </div>
  );
}

function StatusMessage({
  status,
  onReconnect,
}: {
  status: SessionStatus;
  onReconnect: () => void;
}) {
  if (status === "Not Found") {
    return (
      <>
        <h3>Board Not Found</h3>
        <p>The board you're looking for doesn't exist or has expired.</p>
        <Link to="/dashboard" className="status-link">
          Back to Dashboard
        </Link>
      </>
    );
  } else if (status === "Error") {
    return (
      <>
        <h3>Connection Error</h3>
        <p>Failed to connect to the board. Please try again.</p>
        <div className="status-link" onClick={onReconnect}>
          Try Again
        </div>
      </>
    );
  } else if (status === "Disconnected") {
    return (
      <>
        <h3>Disconnected</h3>
        <p>You have been disconnected from the board.</p>
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
          Connecting to board...
        </h3>
        <p>Please wait while we connect you to the collaborative board.</p>
      </>
    );
  }
}
