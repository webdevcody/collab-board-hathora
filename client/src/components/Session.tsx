import { useState, useEffect } from "react";
import { useOutletContext, useParams, Link } from "react-router";
import { lookupRoom } from "../api/rooms";
import { getBoard } from "../api/boards";
import { SessionClient } from "../sessionClient";
import type { BoardSessionData } from "../../../common/messages";
import hyperlink from "../assets/hyperlink.svg";
import Board from "./Board/index";

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
  const { boardId } = useParams<{ boardId: string }>();
  const { token, userId } = useOutletContext<{
    token: string;
    userId: string;
  }>();
  const [status, setStatus] = useState<SessionStatus>("Connecting");
  const [socket, setSocket] = useState<SessionClient>();
  const [snapshot, setSnapshot] = useState<BoardSessionData>();
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  if (boardId == null) {
    throw new Error("Board Id is missing");
  }

  const connectToRoom = async () => {
    try {
      setStatus("Connecting");

      // First, fetch the board information
      let board: BoardInfo;
      try {
        board = await getBoard(boardId, token);
        setBoardInfo(board);
        setRoomId(board.hathoraRoomId);
      } catch (error) {
        console.error("Failed to fetch board info:", error);
        setStatus("Not Found");
        return;
      }

      // Then, use the room ID to get session connectivity information
      const sessionInfo = await lookupRoom(board.hathoraRoomId, token);
      if (sessionInfo.host == null || sessionInfo.token == null) {
        setStatus("Not Found");
        return;
      }

      const socket = await SessionClient.connect(
        sessionInfo.host,
        sessionInfo.token
      );
      socket.onMessage(setSnapshot);
      setStatus("Connected");
      setSocket(socket);
      console.log("Connected", board.hathoraRoomId);
      socket.onClose(() => {
        console.log("Disconnected", board.hathoraRoomId);
        setStatus("Disconnected");
      });
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Error");
    }
  };

  useEffect(() => {
    connectToRoom();
  }, [boardId, token]);

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
        client={socket}
        snapshot={snapshot}
        boardInfo={boardInfo}
        onReconnect={connectToRoom}
      />
    </div>
  );
}

function SessionHeader({
  roomId,
  boardInfo
}: {
  roomId: string | null;
  boardInfo: BoardInfo | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/boards/${boardInfo?.id}`;
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
        <h2>{boardInfo?.name || `Board: ${roomId || "Loading..."}`}</h2>
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
  client,
  snapshot,
  boardInfo,
  onReconnect
}: {
  userId: string;
  status: SessionStatus;
  client: SessionClient | undefined;
  snapshot: BoardSessionData | undefined;
  boardInfo: BoardInfo | null;
  onReconnect: () => void;
}) {
  return (
    <div className="session-content">
      {status === "Connected" && client != null && snapshot != null ? (
        <Board
          userId={userId}
          connectionHost={client.host}
          snapshot={snapshot}
          client={client}
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
  onReconnect
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
