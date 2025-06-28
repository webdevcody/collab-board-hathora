import { useOutletContext } from "react-router";

export type RoomSessionData = {
  messages: { userId: string; msg: string; ts: Date }[];
};

type RoomProps = {
  socket: WebSocket;
  snapshot: RoomSessionData;
};
export default function Room({ socket, snapshot }: RoomProps) {
  const { userId } = useOutletContext<{ token: string; userId: string }>();

  return (
    <div className="chat-container">
      <div className="messages-container">
        <ul className="messages-list">
          {snapshot.messages.map((msg, i) => (
            <li key={i} className={`message ${msg.userId === userId ? "own" : ""}`}>
              <div className={`message-author ${msg.userId === userId ? "own" : ""}`}>
                {msg.userId}
                {msg.userId === userId && " (You)"}
              </div>
              <div className="message-content">{msg.msg}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="message-input-container">
        <input
          className="message-input"
          type="text"
          placeholder="Type your message and press Enter..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim().length > 0) {
              socket.send(e.currentTarget.value.trim());
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
