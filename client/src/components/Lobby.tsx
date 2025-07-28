import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { createBoard, getBoards, deleteBoard } from "../api/boards";
import { Footer } from "./Landing";

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
  const [deletingBoardId, setDeletingBoardId] = useState<number | null>(null);

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
      navigate(`/boards/${board.id}`);
    } catch (error) {
      console.error("Failed to create board:", error);
      setLoading(false);
    }
  };

  const handleOpenBoard = (board: Board) => {
    navigate(`/boards/${board.id}`);
  };

  const handleDeleteBoard = async (boardId: number, boardName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${boardName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingBoardId(boardId);
    try {
      await deleteBoard(boardId, token);
      // Refresh the boards list
      await fetchUserBoards();
    } catch (error) {
      console.error("Failed to delete board:", error);
      alert("Failed to delete board. Please try again.");
    } finally {
      setDeletingBoardId(null);
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
      minute: "2-digit"
    });
  };

  return (
    <>
      <div className="lobby-container">
        <div className="card">
          <div className="dashboard-header">
            <h1 className="dashboard-title">My Boards</h1>
            <button
              className="button"
              onClick={() => setShowCreateForm(true)}
              disabled={loading || showCreateForm}
              aria-label="Create new board"
            >
              <span className="button-icon">✨</span>New Board
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
            <LoadingState />
          ) : boards.length === 0 ? (
            <EmptyState
              onCreateBoard={() => setShowCreateForm(true)}
              showCreateForm={showCreateForm}
            />
          ) : (
            <div className="boards-grid">
              {boards.map(board => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onOpen={() => handleOpenBoard(board)}
                  onDelete={() => handleDeleteBoard(board.id, board.name)}
                  formatDate={formatDate}
                  isDeleting={deletingBoardId === board.id}
                />
              ))}
            </div>
          )}

          <JoinBoardSection
            onJoinBoard={boardId => navigate(`/boards/${boardId.trim()}`)}
            loading={loading}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <p>Loading your boards...</p>
    </div>
  );
}

function EmptyState({
  onCreateBoard,
  showCreateForm
}: {
  onCreateBoard: () => void;
  showCreateForm: boolean;
}) {
  return (
    <div className="empty-state">
      <h3>No boards yet</h3>
      <p>Create your first board to start collaborating with your team!</p>
      {!showCreateForm && (
        <button
          className="button"
          onClick={onCreateBoard}
          aria-label="Create your first board"
        >
          <span className="button-icon">🎨</span>
          Create Your First Board
        </button>
      )}
    </div>
  );
}

function CreateBoardForm({
  boardName,
  setBoardName,
  onCreateBoard,
  onCancel,
  loading
}: {
  boardName: string;
  setBoardName: (name: string) => void;
  onCreateBoard: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && boardName.trim()) {
      onCreateBoard();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className="create-board-form"
      role="form"
      aria-labelledby="create-board-title"
    >
      <h3 id="create-board-title">Create New Board</h3>
      <div className="form-row">
        <input
          className="input"
          type="text"
          placeholder="Enter board name"
          value={boardName}
          onChange={e => setBoardName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoFocus
          aria-label="Board name"
          aria-describedby="board-name-help"
        />
        <div className="form-actions">
          <button
            className="button"
            onClick={onCreateBoard}
            disabled={loading || !boardName.trim()}
            aria-label={loading ? "Creating board..." : "Create board"}
          >
            {loading ? (
              <>
                <span
                  className="loading-spinner-small"
                  aria-hidden="true"
                ></span>
                Creating...
              </>
            ) : (
              "Create"
            )}
          </button>
          <button
            className="button button-secondary"
            onClick={onCancel}
            disabled={loading}
            aria-label="Cancel board creation"
          >
            Cancel
          </button>
        </div>
      </div>
      <div id="board-name-help" className="form-help">
        Press Enter to create or Escape to cancel
      </div>
    </div>
  );
}

function BoardCard({
  board,
  onOpen,
  onDelete,
  formatDate,
  isDeleting
}: {
  board: Board;
  onOpen: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
  isDeleting: boolean;
}) {
  return (
    <div
      className="board-card"
      role="article"
      aria-label={`Board: ${board.name}`}
    >
      <div className="board-card-header">
        <h3 className="board-card-title">{board.name}</h3>
        <button
          className="board-card-delete"
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete board"
          aria-label={`Delete board: ${board.name}`}
        >
          {isDeleting ? (
            <span className="loading-spinner-small" aria-hidden="true"></span>
          ) : (
            "×"
          )}
        </button>
      </div>
      <div className="board-card-meta">
        <span className="board-card-date">
          Created: {formatDate(board.createdAt)}
        </span>
        <span className="board-card-id">ID: {board.id}</span>
      </div>
      <div className="board-card-actions">
        <button
          className="button"
          onClick={onOpen}
          disabled={isDeleting}
          aria-label={`Open board: ${board.name}`}
        >
          <span className="button-icon">🚀</span>
          Open Board
        </button>
      </div>
    </div>
  );
}

function JoinBoardSection({
  onJoinBoard,
  loading
}: {
  onJoinBoard: (boardId: string) => void;
  loading: boolean;
}) {
  const [boardId, setBoardId] = useState<string>("");

  const handleJoinBoard = () => {
    if (boardId.trim()) {
      onJoinBoard(boardId.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && boardId.trim() !== "") {
      handleJoinBoard();
    }
  };

  return (
    <div
      className="join-board-section"
      role="region"
      aria-labelledby="join-board-title"
    >
      <h3 id="join-board-title">Join Existing Board</h3>
      <p>Enter a board ID to join someone else's board</p>
      <div className="join-room-container">
        <input
          className="input join-room-input"
          type="text"
          disabled={loading}
          placeholder="Enter Board ID"
          value={boardId}
          onChange={e => setBoardId(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Board ID to join"
          aria-describedby="join-board-help"
        />
        <button
          className="button join-room-button"
          onClick={handleJoinBoard}
          disabled={loading || boardId.trim() === ""}
          aria-label="Join board"
        >
          <span className="button-icon">🔗</span>
          Join
        </button>
      </div>
      <div id="join-board-help" className="form-help">
        Press Enter to join the board
      </div>
    </div>
  );
}
