import { useOutletContext } from "react-router";
import { useState } from "react";
import "../styles/chat.css";
import "../styles/input.css";

export type RoomSessionData = {
  messages: { userId: string; msg: string; ts: Date }[];
  connectedUsers: string[];
};

type RoomProps = {
  socket: WebSocket;
  snapshot: RoomSessionData;
};
export default function Room({ socket, snapshot }: RoomProps) {
  const { userId } = useOutletContext<{ token: string; userId: string }>();
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    socket.send(message.trim());
    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="connected-users">
        <h4>Connected Users ({snapshot.connectedUsers.length})</h4>
        <div className="users-list">
          {snapshot.connectedUsers.map((user) => (
            <span key={user} className={`user-pill ${user === userId ? "own" : ""}`}>
              {user}
            </span>
          ))}
        </div>
      </div>
      <div className="messages-container">
        <ul className="messages-list">
          {snapshot.messages.map((msg, i) => (
            <li key={i} className={`message ${msg.userId === userId ? "own" : ""}`}>
              <div className="message-header">
                <div className={`message-author ${msg.userId === userId ? "own" : ""}`}>{msg.userId}</div>
                <div className="message-timestamp">
                  {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
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
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && message.trim() !== "") {
              sendMessage();
            }
          }}
        />
        <button className="send-button" onClick={sendMessage} disabled={message.trim() === ""} title="Send message">
          ➤
        </button>
      </div>
    </div>
  );
}
