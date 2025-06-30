import { useState } from "react";
import { RoomSessionData, Message } from "../sessionClient";
import "../styles/chat.css";
import "../styles/input.css";

export default function Room({
  userId,
  snapshot,
  onSend,
}: {
  userId: string;
  snapshot: RoomSessionData;
  onSend: (message: string) => void;
}) {
  return (
    <div className="chat-container">
      <UserList connectedUsers={snapshot.connectedUsers} currentUserId={userId} />
      <MessageList messages={snapshot.messages} currentUserId={userId} />
      <MessageInput onSend={onSend} />
    </div>
  );
}

function UserList({ connectedUsers, currentUserId }: { connectedUsers: string[]; currentUserId: string }) {
  return (
    <div className="connected-users">
      <h4>Connected Users ({connectedUsers.length})</h4>
      <div className="users-list">
        {connectedUsers.map((user) => (
          <span key={user} className={`user-pill ${user === currentUserId ? "own" : ""}`}>
            {user}
          </span>
        ))}
      </div>
    </div>
  );
}

function MessageList({ messages, currentUserId }: { messages: Message[]; currentUserId: string }) {
  return (
    <div className="messages-container">
      <ul className="messages-list">
        {messages.map((msg, i) => (
          <MessageDisplay key={i} message={msg} currentUserId={currentUserId} />
        ))}
      </ul>
    </div>
  );
}

function MessageDisplay({ message, currentUserId }: { message: Message; currentUserId: string }) {
  return (
    <li className={`message ${message.userId === currentUserId ? "own" : ""}`}>
      <div className="message-header">
        <div className={`message-author ${message.userId === currentUserId ? "own" : ""}`}>{message.userId}</div>
        <div className="message-timestamp">
          {new Date(message.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      <div className="message-content">{message.msg}</div>
    </li>
  );
}

function MessageInput({ onSend }: { onSend: (message: string) => void }) {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    onSend(message.trim());
    setMessage("");
  };

  return (
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
      <button className="send-button" onClick={sendMessage} disabled={message.trim() === ""}>
        ➤
      </button>
    </div>
  );
}
