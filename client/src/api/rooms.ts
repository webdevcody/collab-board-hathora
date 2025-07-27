import { fetchJson } from "./util";

export async function lookupRoom(
  roomId: string,
  userToken: string
): Promise<{ host: string | null; token: string | null }> {
  return await fetchJson(`/api/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
}
