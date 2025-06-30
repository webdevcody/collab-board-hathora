import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { createRoom } from "../backendClient";
import "../styles/lobby.css";

export default function Lobby() {
  const navigate = useNavigate();
  const { token } = useOutletContext<{ token: string; userId: string }>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const roomId = await createRoom(token);
      console.log("Created room", roomId);
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId.trim()}`);
  };

  return (
    <div className="container">
      <div className="card lobby-container">
        <h1 className="lobby-title">Lobby</h1>
        <div className="lobby-actions">
          <CreateRoomSection loading={loading} onCreateRoom={handleCreateRoom} />
          <JoinRoomSection loading={loading} onJoinRoom={handleJoinRoom} />
        </div>
      </div>
    </div>
  );
}

function CreateRoomSection({ loading, onCreateRoom }: { loading: boolean; onCreateRoom: () => void }) {
  return (
    <div className="lobby-section">
      <h3>Start a New Room</h3>
      <button className="button" disabled={loading} onClick={onCreateRoom}>
        {loading ? "Creating..." : "Create Room"}
      </button>
    </div>
  );
}

function JoinRoomSection({ loading, onJoinRoom }: { loading: boolean; onJoinRoom: (roomId: string) => void }) {
  const [roomId, setRoomId] = useState<string>("");
  return (
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
              onJoinRoom(roomId.trim());
            }
          }}
        />
        <button
          className="button join-room-button"
          onClick={() => onJoinRoom(roomId.trim())}
          disabled={loading || roomId.trim() === ""}
        >
          Join
        </button>
      </div>
    </div>
  );
}
