import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { createRoom } from "./backendClient";

export default function Home() {
  const navigate = useNavigate();
  const { token } = useOutletContext<{ token: string; userId: string }>();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <>
      <div>
        <button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const roomId = await createRoom(token);
            setLoading(false);
            console.log("Room ID:", roomId);
            navigate(`/room/${roomId}`);
          }}
        >
          Create Room
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Join Room ID"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.length > 0) {
              navigate(`/${e.currentTarget.value}`);
            }
          }}
        />
      </div>
    </>
  );
}
