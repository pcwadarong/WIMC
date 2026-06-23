/** route handler(JSON) 패칭 공용 헬퍼 — 실패 시 throw */
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}
