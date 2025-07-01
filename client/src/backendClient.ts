export async function login(userId: string): Promise<string> {
  const res = await fetch(`/api/login`, {
    method: "POST",
    body: JSON.stringify({ userId }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to login: ${res.status}`);
  }
  const { token } = await res.json();
  return token;
}

export async function createRoom(userToken: string): Promise<string> {
  const res = await fetch(`/api/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to create room: ${res.status}`);
  }
  const { roomId } = await res.json();
  return roomId;
}

export async function lookupRoom(
  roomId: string,
  userToken: string,
): Promise<{ sessionUrl: string; sessionToken: string } | null> {
  const res = await fetch(`/api/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch room session: ${res.status}`);
  }
  const { url, token } = await res.json();
  return { sessionUrl: url, sessionToken: token };
}
