export async function fetchJson(path: string, options?: RequestInit) {
  const url = `${import.meta.env.VITE_BACKEND_API ?? "http://localhost:8080"}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}
