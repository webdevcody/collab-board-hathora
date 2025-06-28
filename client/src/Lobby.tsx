import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { createRoom } from "./backendClient";

export default function Lobby() {
  const navigate = useNavigate();
  const { token } = useOutletContext<{ token: string; userId: string }>();
  const [loading, setLoading] = useState<boolean>(false);

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
            <input
              className="input"
              type="text"
              disabled={loading}
              placeholder="Enter Room ID"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                  navigate(`/room/${e.currentTarget.value.trim()}`);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
