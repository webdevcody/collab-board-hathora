import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { createBoard, getBoards, deleteBoard } from "../backendClient";

interface Board {
  id: number;
  name: string;
  userId: string;
  data: any;
  hathoraRoomId: string;
  createdAt: string;
  updatedAt: string;
}

export default function Lobby() {
  const navigate = useNavigate();
  const { token, userId } = useOutletContext<{
    token: string;
    userId: string;
  }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [fetchingBoards, setFetchingBoards] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newBoardName, setNewBoardName] = useState<string>("");

  const fetchUserBoards = async () => {
    try {
      setFetchingBoards(true);
      const userBoards = await getBoards(token);
      setBoards(userBoards);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      setFetchingBoards(false);
    }
  };

  useEffect(() => {
    fetchUserBoards();
  }, [token]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    setLoading(true);
    try {
      const board = await createBoard(newBoardName.trim(), token);
      console.log("Created board", board);
      // Navigate to the new board
      navigate(`/room/${board.hathoraRoomId}`);
    } catch (error) {
      console.error("Failed to create board:", error);
      setLoading(false);
    }
  };

  const handleOpenBoard = (board: Board) => {
    navigate(`/room/${board.hathoraRoomId}`);
  };

  const handleDeleteBoard = async (boardId: number, boardName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${boardName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteBoard(boardId, token);
      // Refresh the boards list
      await fetchUserBoards();
    } catch (error) {
      console.error("Failed to delete board:", error);
      alert("Failed to delete board. Please try again.");
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewBoardName("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container">
      <div className="card lobby-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Boards</h1>
          <button
            className="button"
            onClick={() => setShowCreateForm(true)}
            disabled={loading || showCreateForm}
          >
            + New Board
          </button>
        </div>

        {showCreateForm && (
          <CreateBoardForm
            boardName={newBoardName}
            setBoardName={setNewBoardName}
            onCreateBoard={handleCreateBoard}
            onCancel={handleCancelCreate}
            loading={loading}
          />
        )}

        {fetchingBoards ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="empty-state">
            <h3>No boards yet</h3>
            <p>Create your first board to start collaborating!</p>
            {!showCreateForm && (
              <button
                className="button"
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Board
              </button>
            )}
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onOpen={() => handleOpenBoard(board)}
                onDelete={() => handleDeleteBoard(board.id, board.name)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        <JoinBoardSection
          onJoinBoard={(boardId) => navigate(`/room/${boardId.trim()}`)}
          loading={loading}
        />
      </div>
    </div>
  );
}

function CreateBoardForm({
  boardName,
  setBoardName,
  onCreateBoard,
  onCancel,
  loading,
}: {
  boardName: string;
  setBoardName: (name: string) => void;
  onCreateBoard: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="create-board-form">
      <h3>Create New Board</h3>
      <div className="form-row">
        <input
          className="input"
          type="text"
          placeholder="Enter board name"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && boardName.trim()) {
              onCreateBoard();
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
          disabled={loading}
          autoFocus
        />
        <div className="form-actions">
          <button
            className="button"
            onClick={onCreateBoard}
            disabled={loading || !boardName.trim()}
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            className="button button-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function BoardCard({
  board,
  onOpen,
  onDelete,
  formatDate,
}: {
  board: Board;
  onOpen: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="board-card">
      <div className="board-card-header">
        <h3 className="board-card-title">{board.name}</h3>
        <button
          className="board-card-delete"
          onClick={onDelete}
          title="Delete board"
        >
          ×
        </button>
      </div>
      <div className="board-card-meta">
        <span className="board-card-date">
          Created: {formatDate(board.createdAt)}
        </span>
        <span className="board-card-id">ID: {board.id}</span>
      </div>
      <div className="board-card-actions">
        <button className="button" onClick={onOpen}>
          Open Board
        </button>
      </div>
    </div>
  );
}

function JoinBoardSection({
  onJoinBoard,
  loading,
}: {
  onJoinBoard: (boardId: string) => void;
  loading: boolean;
}) {
  const [boardId, setBoardId] = useState<string>("");

  return (
    <div className="join-board-section">
      <h3>Join Existing Board</h3>
      <p>Enter a board ID to join someone else's board</p>
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
