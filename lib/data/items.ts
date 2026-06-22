import "server-only";
import { createClient } from "@/lib/supabase/server";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
