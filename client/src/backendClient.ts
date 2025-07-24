export async function login(userId: string): Promise<{ token: string }> {
  return await fetchJson(`/api/login`, {
    method: "POST",
    body: JSON.stringify({ userId, username: userId }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function createRoom(
  userToken: string
): Promise<{ roomId: string }> {
  return await fetchJson(`/api/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
  });
}

export async function lookupRoom(
  roomId: string,
  userToken: string
): Promise<{ host: string | null; token: string | null }> {
  return await fetchJson(`/api/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
}

// Board management functions
export async function createBoard(
  name: string,
  userToken: string
): Promise<{
  id: number;
  name: string;
  userId: string;
  data: any;
  hathoraRoomId: string;
  createdAt: string;
  updatedAt: string;
}> {
  return await fetchJson(`/api/boards`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
  });
}

export async function getBoards(userToken: string): Promise<
  Array<{
    id: number;
    name: string;
    userId: string;
    data: any;
    hathoraRoomId: string;
    createdAt: string;
    updatedAt: string;
  }>
> {
  return await fetchJson(`/api/boards`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
}

export async function getBoardByRoomId(
  roomId: string,
  userToken: string
): Promise<{
  id: number;
  name: string;
  userId: string;
  data: any;
  hathoraRoomId: string;
  createdAt: string;
  updatedAt: string;
}> {
  return await fetchJson(`/api/boards/by-room/${roomId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
}

export async function updateBoard(
  boardId: number,
  updates: { name?: string; data?: any },
  userToken: string
): Promise<{
  id: number;
  name: string;
  userId: string;
  data: any;
  hathoraRoomId: string;
  createdAt: string;
  updatedAt: string;
}> {
  return await fetchJson(`/api/boards/${boardId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
  });
}

export async function deleteBoard(
  boardId: number,
  userToken: string
): Promise<{ message: string }> {
  return await fetchJson(`/api/boards/${boardId}`, {
    method: "DELETE",
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
