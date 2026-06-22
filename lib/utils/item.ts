import type { Item, Outfit } from "@/types";

/** 대표 이미지 URL (없으면 null) */
export function primaryImageUrl(item: Item): string | null {
  if (!item.images || item.images.length === 0) return null;
  return (item.images.find((i) => i.is_primary) ?? item.images[0]).url;
}

export type ItemSort = "recent" | "name" | "price_high" | "price_low";

export const ITEM_SORT_LABELS: Record<ItemSort, string> = {
  recent: "최근순",
  name: "이름순",
  price_high: "가격 높은순",
  price_low: "가격 낮은순",
};

/** 아이템 정렬. recent는 입력 순서(이미 created_at desc) 유지 */
export function sortItems(items: Item[], sort: ItemSort): Item[] {
  const arr = [...items];
  switch (sort) {
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    case "price_high":
      return arr.sort(
        (a, b) => (b.purchase_price ?? -1) - (a.purchase_price ?? -1),
      );
    case "price_low":
      return arr.sort(
        (a, b) =>
          (a.purchase_price ?? Number.POSITIVE_INFINITY) -
          (b.purchase_price ?? Number.POSITIVE_INFINITY),
      );
    default:
      return arr;
  }
}

/** id → 엔티티 맵 */
export function indexById<T extends { id: string }>(arr: T[]): Record<string, T> {
  const map: Record<string, T> = {};
  for (const x of arr) map[x.id] = x;
  return map;
}

export interface OutfitThumb {
  id: string;
  name: string;
  thumb: string | null;
}

/** 코디 목록을 썸네일(첫 아이템 대표 이미지) 카드용으로 변환 */
export function buildOutfitThumbs(
  outfits: Outfit[],
  itemsById: Record<string, Item>,
): OutfitThumb[] {
  return outfits.map((o) => {
    const first = (o.item_ids ?? []).map((id) => itemsById[id]).find(Boolean);
    return {
      id: o.id,
      name: o.name || "코디",
      thumb: first ? primaryImageUrl(first) : null,
    };
  });
}
