import React from "react";
import { CursorPosition } from "../../../../sessionClient";

interface CursorProps {
  position: CursorPosition;
  userName: string;
}

export default function Cursor({ position, userName }: CursorProps) {
  return (
    <div
      className="remote-cursor"
      style={{
        left: position.x,
        top: position.y,
        position: "absolute",
        pointerEvents: "none",
        zIndex: 1000,
        transform: "translate(-2px, -2px)"
      }}
    >
      <div
        className="cursor-pointer"
        style={{
          fontSize: "20px",
          color: "#667eea",
          textShadow: "0 1px 3px rgba(0,0,0,0.5)"
        }}
      >
        ↖
      </div>
      <div className="cursor-label">{userName}</div>
    </div>
  );
}
