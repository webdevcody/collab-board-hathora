import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { createRoom } from "../backendClient";

export default function Lobby() {
  const navigate = useNavigate();
  const { token } = useOutletContext<{ token: string; userId: string }>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateBoard = async () => {
    setLoading(true);
    try {
      const { roomId } = await createRoom(token);
      console.log("Created board", roomId);
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Failed to create board:", error);
      setLoading(false);
    }
  };

  const handleJoinBoard = (boardId: string) => {
    navigate(`/room/${boardId.trim()}`);
  };

  return (
    <div className="container">
      <div className="card lobby-container">
        <h1 className="lobby-title">Collaborative Boards</h1>
        <div className="lobby-actions">
          <CreateBoardSection
            loading={loading}
            onCreateBoard={handleCreateBoard}
          />
          <JoinBoardSection loading={loading} onJoinBoard={handleJoinBoard} />
        </div>
      </div>
    </div>
  );
}

function CreateBoardSection({
  loading,
  onCreateBoard,
}: {
  loading: boolean;
  onCreateBoard: () => void;
}) {
  return (
    <div className="lobby-section">
      <h3>Create New Board</h3>
      <button className="button" onClick={onCreateBoard} disabled={loading}>
        {loading ? "Creating..." : "Create Board"}
      </button>
    </div>
  );
}

function JoinBoardSection({
  loading,
  onJoinBoard,
}: {
  loading: boolean;
  onJoinBoard: (boardId: string) => void;
}) {
  const [boardId, setBoardId] = useState<string>("");
  return (
    <div className="lobby-section">
      <h3>Join Existing Board</h3>
      <div className="join-room-container">
        <input
          className="input join-room-input"
          type="text"
          disabled={loading}
          placeholder="Enter Board ID"
          value={boardId}
          onChange={(e) => setBoardId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && boardId.trim() !== "") {
              onJoinBoard(boardId.trim());
            }
          }}
        />
        <button
          className="button join-room-button"
          onClick={() => onJoinBoard(boardId.trim())}
          disabled={loading || boardId.trim() === ""}
        >
          Join
        </button>
      </div>
    </div>
  );
}
