import { fetchJson } from "./util";

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
      Authorization: `Bearer ${userToken}`
    }
  });
}

export async function getBoard(
  boardId: string,
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
    headers: { Authorization: `Bearer ${userToken}` }
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
    headers: { Authorization: `Bearer ${userToken}` }
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
    headers: { Authorization: `Bearer ${userToken}` }
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
      Authorization: `Bearer ${userToken}`
    }
  });
}

export async function deleteBoard(
  boardId: number,
  userToken: string
): Promise<{ message: string }> {
  return await fetchJson(`/api/boards/${boardId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${userToken}` }
  });
}
