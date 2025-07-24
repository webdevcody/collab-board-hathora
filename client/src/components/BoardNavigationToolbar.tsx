import React from "react";
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
        <Link
          to="/dashboard"
          className="button button-secondary dashboard-button"
        >
          <span className="button-icon">📊</span>
          Dashboard
        </Link>
      </div>
    </div>
  );
}

export type { BoardInfo };
