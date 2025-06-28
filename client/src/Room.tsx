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
    <div>
      <ul>
        {snapshot.messages.map((msg, i) => (
          <li key={i}>
            <strong>
              {msg.userId}
              {msg.userId === userId && "*"}
            </strong>
            : {msg.msg}
          </li>
        ))}
      </ul>
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget.value.length > 0) {
            socket.send(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}
