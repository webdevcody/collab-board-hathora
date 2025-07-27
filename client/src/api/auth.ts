import { fetchJson } from "./util";

export async function login(userId: string): Promise<{ token: string }> {
  return await fetchJson(`/api/login`, {
    method: "POST",
    body: JSON.stringify({ userId, username: userId }),
    headers: { "Content-Type": "application/json" }
  });
}
