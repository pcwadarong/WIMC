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
