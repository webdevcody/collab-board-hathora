import { useState, useEffect, useRef } from "react";
import { useOutletContext, useParams, Link } from "react-router";
import { lookupRoom } from "../api/rooms";
import { getBoard } from "../api/boards";
import { SessionClient } from "../sessionClient";
import hyperlink from "../assets/hyperlink.svg";
import Board from "./Board/index";
import { BoardSessionData } from "../../../session-server/src/types";

type SessionStatus =
  | "Connecting"
  | "Connected"
  | "Disconnected"
  | "Not Found"
  | "Error"
  | "Retrying";

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
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<number | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (boardId == null) {
    throw new Error("Board Id is missing");
  }

  const connectToRoom = async (isRetry: boolean = false) => {
    try {
      if (!isRetry) {
        setStatus("Connecting");
        setRetryCount(0);
      } else {
        setStatus("Retrying");
      }

      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
        setRetryTimeout(null);
      }

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

      // Create the SessionClient object first
      const socket = SessionClient.create(sessionInfo.host);

      // Set up event listeners before connecting
      socket.onMessage(setSnapshot);
      socket.onClose(() => {
        console.log("Disconnected", board.hathoraRoomId);
        setStatus("Disconnected");
      });

      // Now connect with increased timeout for spinning up hosts
      const timeoutMs = 45000; // 45 seconds for initial connection
      await socket.connect(sessionInfo.token, timeoutMs);

      setStatus("Connected");
      setSocket(socket);
      setRetryCount(0);
      console.log("Connected", board.hathoraRoomId);
    } catch (error) {
      console.error("Connection error:", error);

      // Implement exponential backoff for retries
      const maxRetries = 5;
      const currentRetryCount = isRetry ? retryCount : 0;

      if (currentRetryCount < maxRetries) {
        // Calculate backoff delay: 2^attempt * 2000ms (2s, 4s, 8s, 16s, 32s)
        const delayMs = Math.pow(2, currentRetryCount) * 2000;
        const nextRetryCount = currentRetryCount + 1;

        setRetryCount(nextRetryCount);
        setRetryTimeout(delayMs);
        setStatus("Retrying");

        console.log(
          `Retrying connection (attempt ${nextRetryCount}/${maxRetries}) in ${delayMs}ms`
        );

        retryTimeoutRef.current = setTimeout(() => {
          connectToRoom(true);
        }, delayMs);
      } else {
        setStatus("Error");
        setRetryCount(0);
      }
    }
  };

  useEffect(() => {
    connectToRoom();

    // Cleanup retry timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
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
        retryCount={retryCount}
        retryTimeout={retryTimeout}
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
  retryCount,
  retryTimeout,
  onReconnect
}: {
  userId: string;
  status: SessionStatus;
  client: SessionClient | undefined;
  snapshot: BoardSessionData | undefined;
  boardInfo: BoardInfo | null;
  retryCount: number;
  retryTimeout: number | null;
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
        <StatusMessage
          status={status}
          retryCount={retryCount}
          retryTimeout={retryTimeout}
          onReconnect={onReconnect}
        />
      )}
    </div>
  );
}

function StatusMessage({
  status,
  retryCount,
  retryTimeout,
  onReconnect
}: {
  status: SessionStatus;
  retryCount: number;
  retryTimeout: number | null;
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
  } else if (status === "Retrying") {
    const timeoutSeconds = retryTimeout ? Math.ceil(retryTimeout / 1000) : 0;
    return (
      <>
        <div className="loading-spinner"></div>
        <h3>Retrying Connection...</h3>
        <p>
          Attempt {retryCount} of 5. The host may still be starting up.
          {timeoutSeconds > 0 && ` Next attempt in ${timeoutSeconds} seconds.`}
        </p>
        <div className="status-actions">
          <div className="status-link" onClick={onReconnect}>
            Try Now
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="loading-spinner"></div>
        <h3>Connecting to board...</h3>
        <p>Please wait while we connect you to the collaborative board.</p>
      </>
    );
  }
}
