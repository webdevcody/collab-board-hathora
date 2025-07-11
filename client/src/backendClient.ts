export async function login(userId: string): Promise<{ token: string }> {
  return await fetchJson(`/api/login`, {
    method: "POST",
    body: JSON.stringify({ userId }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function createRoom(userToken: string): Promise<{ roomId: string }> {
  return await fetchJson(`/api/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
  });
}

export async function lookupRoom(
  roomId: string,
  userToken: string,
): Promise<{ host: string | null; token: string | null }> {
  return await fetchJson(`/api/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
}

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}
