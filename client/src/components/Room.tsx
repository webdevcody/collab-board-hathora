import { useState, useEffect, useRef } from "react";
import { RoomSessionData, Message } from "../sessionClient";
import "../styles/chat.css";
import "../styles/input.css";

export default function Room({
  userId,
  snapshot,
  connectionHost,
  onSend,
}: {
  userId: string;
  connectionHost: string;
  snapshot: RoomSessionData;
  onSend: (message: string) => void;
}) {
  return (
    <div className="chat-container">
      <RoomHeader connectedUsers={snapshot.connectedUsers} currentUserId={userId} connectionHost={connectionHost} />
      <MessageList messages={snapshot.messages} currentUserId={userId} />
      <MessageInput onSend={onSend} />
    </div>
  );
}

function RoomHeader({
  connectedUsers,
  currentUserId,
  connectionHost,
}: {
  connectedUsers: string[];
  currentUserId: string;
  connectionHost: string;
}) {
  return (
    <div className="connected-users">
      <div className="connection-host">Connected to: {connectionHost}</div>
      <div className="users-section">
        <span className="users-label">Users:</span>
        <div className="users-list">
          {connectedUsers.map((user) => (
            <span key={user} className={`user-pill ${user === currentUserId ? "own" : ""}`}>
              {user}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageList({ messages, currentUserId }: { messages: Message[]; currentUserId: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="messages-container">
      <ul className="messages-list">
        {messages.map((msg, i) => (
          <MessageDisplay key={i} message={msg} currentUserId={currentUserId} />
        ))}
        <div ref={messagesEndRef} />
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim() !== "") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="message-input-container">
      <textarea
        className="message-input"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <button className="send-button" onClick={sendMessage} disabled={message.trim() === ""}>
        ➤
      </button>
    </div>
  );
}
