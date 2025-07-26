import React, { useState } from "react";
import { Link } from "react-router";

interface BoardInfo {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface BoardNavigationToolbarProps {
  boardInfo: BoardInfo | null;
  isDarkMode?: boolean;
  visible?: boolean;
  connectedUsers?: string[];
  currentUserId?: string;
}

export default function BoardNavigationToolbar({
  boardInfo,
  isDarkMode = false,
  visible = true,
  connectedUsers = [],
  currentUserId,
}: BoardNavigationToolbarProps) {
  const [showToast, setShowToast] = useState(false);

  const handleShareRoom = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`board-navigation-toolbar ${isDarkMode ? "dark-mode" : ""}`}
    >
      <div className="board-info">
        <div className="board-name">{boardInfo?.name || "Untitled Board"}</div>
        <div className="board-meta">
          {boardInfo && <span className="board-id">ID: {boardInfo.id}</span>}
        </div>
      </div>

      {/* Connected Users Section */}
      <div className="users-section">
        <span className="users-label">
          Users ({connectedUsers?.length || 0})
        </span>
        <div className="users-list">
          {connectedUsers?.map((user) => (
            <span
              key={user}
              className={`user-pill ${user === currentUserId ? "own" : ""}`}
            >
              {user}
            </span>
          ))}
        </div>
      </div>

      <div className="navigation-actions">
        <button
          onClick={handleShareRoom}
          className="button button-secondary share-button"
          title="Share room"
        >
          <span className="button-icon">🔗</span>
          Share
        </button>
        <Link
          to="/dashboard"
          className="button button-secondary dashboard-button"
        >
          <span className="button-icon">📊</span>
          Dashboard
        </Link>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast-notification ${isDarkMode ? "dark-mode" : ""}`}>
          ✅ Copied to clipboard!
        </div>
      )}
    </div>
  );
}

export type { BoardInfo };
