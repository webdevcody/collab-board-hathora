import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { createRoom } from "../backendClient";
import "../styles/lobby.css";

export default function Lobby() {
  const navigate = useNavigate();
  const { token } = useOutletContext<{ token: string; userId: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");

  const joinRoom = () => {
    navigate(`/room/${roomId.trim()}`);
  };

  return (
    <div className="container">
      <div className="card lobby-container">
        <h1 className="lobby-title">Lobby</h1>
        <div className="lobby-actions">
          <div className="lobby-section">
            <h3>Start a New Room</h3>
            <button
              className="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                const roomId = await createRoom(token);
                console.log("Room ID:", roomId);
                navigate(`/room/${roomId}`);
              }}
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
          <div className="lobby-section">
            <h3>Join Existing Room</h3>
            <div className="join-room-container">
              <input
                className="input join-room-input"
                type="text"
                disabled={loading}
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomId.trim() !== "") {
                    joinRoom();
                  }
                }}
              />
              <button
                className="button join-room-button"
                onClick={joinRoom}
                disabled={loading || roomId.trim() === ""}
                title="Join room"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
