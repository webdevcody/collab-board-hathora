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

export async function createRoom(userToken: string): Promise<{ roomId: string }> {
  const res = await fetch(`/api/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to create room: ${res.status}`);
  }
  return await res.json();
}

export async function lookupRoom(roomId: string, userToken: string): Promise<{ url: string; token: string } | null> {
  const res = await fetch(`/api/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch room session: ${res.status}`);
  }
  return await res.json();
}
