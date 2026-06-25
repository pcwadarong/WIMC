import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import type { Item } from "@/types";

export interface ItemFilters {
  /** 대분류 탭: 해당 대분류에 속한 소분류 id 목록 */
  categoryIds?: string[];
  favorite?: boolean;
  search?: string;
  status?: string;
}

export async function getItems(filters: ItemFilters = {}): Promise<Item[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  let q = supabase
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (filters.favorite) q = q.eq("is_favorite", true);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    q = q.in("category_id", filters.categoryIds);
  }
  if (filters.search?.trim()) {
    q = q.ilike("name", `%${filters.search.trim()}%`);
  }

  const { data } = await q;
  return (data as Item[]) ?? [];
}

export async function getItem(id: string): Promise<Item | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", id)
    .single();

  return (data as Item) ?? null;
}

export async function getRecentItems(limit = 3): Promise<Item[]> {
  const items = await getItems();
  return items.slice(0, limit);
}

/** 옷 착용 횟수 — 이 옷이 들어간 코디가 기록(daily_logs)된 횟수 (누적/이번달) */
export async function getItemWears(
  id: string,
): Promise<{ total: number; month: number }> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { total: 0, month: 0 };

  // 이 옷을 포함한 코디들
  const { data: outfits } = await supabase
    .from("outfits")
    .select("id, item_ids")
    .eq("user_id", user.id);
  const outfitIds = new Set(
    (outfits ?? [])
      .filter((o) => ((o.item_ids as string[] | null) ?? []).includes(id))
      .map((o) => o.id as string),
  );

  // 기록 중: 코디에 이 옷이 들었거나(outfit_id) 즉석 조합(item_ids)에 든 경우
  const { data: logs } = await supabase
    .from("daily_logs")
    .select("date, outfit_id, item_ids")
    .eq("user_id", user.id);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let total = 0;
  let month = 0;
  for (const l of (logs as { date: string; outfit_id: string | null; item_ids: string[] | null }[] | null) ?? []) {
    const worn =
      (l.outfit_id && outfitIds.has(l.outfit_id)) || (l.item_ids ?? []).includes(id);
    if (!worn) continue;
    total += 1;
    if (l.date?.startsWith(ym)) month += 1;
  }
  return { total, month };
}

/** 특정 월의 등록 수 / 지출 합계 (필요한 컬럼만, 해당 월만 조회 — 전체 스캔 회피) */
export async function getMonthItemSummary(
  ym: string,
): Promise<{ added: number; spend: number }> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { added: 0, spend: 0 };

  const [y, m] = ym.split("-").map(Number);
  const start = `${ym}-01`;
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("items")
    .select("created_at, purchase_date, purchase_price")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .or(
      `and(created_at.gte.${start},created_at.lt.${next}),and(purchase_date.gte.${start},purchase_date.lt.${next})`,
    );

  const rows = data ?? [];
  let added = 0;
  let spend = 0;
  for (const r of rows as { created_at?: string; purchase_date?: string; purchase_price?: number }[]) {
    if (r.created_at?.startsWith(ym)) added += 1;
    if (r.purchase_date?.startsWith(ym)) spend += r.purchase_price ?? 0;
  }
  return { added, spend };
}
