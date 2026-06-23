import type { ItemFilters } from "@/lib/data/items";

/**
 * 중앙 queryKey 팩토리. prefix 무효화 활용:
 * invalidateQueries(["items"]) → 목록/상세/요약 모두 무효화.
 */
export const qk = {
  items: (filters?: ItemFilters) => ["items", "list", filters ?? {}] as const,
  item: (id: string) => ["items", "detail", id] as const,
  monthItemSummary: (ym: string) => ["items", "month-summary", ym] as const,

  outfits: () => ["outfits", "list"] as const,
  outfit: (id: string) => ["outfits", "detail", id] as const,

  monthLogs: (ym: string) => ["logs", "month", ym] as const,
  log: (date: string) => ["logs", "date", date] as const,

  categories: () => ["categories"] as const,
  profile: () => ["profile"] as const,

  trips: () => ["trips", "list"] as const,
  trip: (id: string) => ["trips", "detail", id] as const,

  stats: () => ["stats"] as const,
};
