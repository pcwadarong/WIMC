import "server-only";
import { getItems } from "@/lib/data/items";
import { getOutfits } from "@/lib/data/outfits";
import { getAllLogs } from "@/lib/data/logs";
import { getCategoryTree } from "@/lib/data/categories";
import { getProfile } from "@/lib/data/profile";
import type { Item } from "@/types";

export interface CountRow {
  label: string;
  count: number;
  hex?: string;
}
export interface BrandRow {
  brand: string;
  total: number;
}
export interface WearRow {
  item: Item;
  count: number;
}

export interface Stats {
  itemCount: number;
  outfitCount: number;
  logCount: number;
  byCategory: CountRow[];
  byColor: CountRow[];
  byBrand: BrandRow[];
  topWorn: WearRow[];
  neverWorn: Item[];
  styleKeywords: string[];
}

export async function getStats(): Promise<Stats> {
  const [items, outfits, logs, categories, profile] = await Promise.all([
    getItems(),
    getOutfits(),
    getAllLogs(),
    getCategoryTree(),
    getProfile(),
  ]);

  // 카테고리 id → 대분류 이름
  const parentNameByCat: Record<string, string> = {};
  for (const p of categories) {
    parentNameByCat[p.id] = p.name;
    for (const c of p.children) parentNameByCat[c.id] = p.name;
  }

  // 카테고리 분포 (대분류)
  const catCounts: Record<string, number> = {};
  for (const it of items) {
    const name = it.category_id ? parentNameByCat[it.category_id] : undefined;
    const key = name ?? "기타";
    catCounts[key] = (catCounts[key] ?? 0) + 1;
  }
  const byCategory = Object.entries(catCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // 색상 분포
  const colorCounts: Record<string, { count: number; hex: string }> = {};
  for (const it of items) {
    for (const c of it.colors ?? []) {
      const cur = colorCounts[c.label] ?? { count: 0, hex: c.hex };
      cur.count += 1;
      colorCounts[c.label] = cur;
    }
  }
  const byColor = Object.entries(colorCounts)
    .map(([label, v]) => ({ label, count: v.count, hex: v.hex }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 브랜드별 금액
  const brandTotals: Record<string, number> = {};
  for (const it of items) {
    if (it.brand && it.purchase_price) {
      brandTotals[it.brand] = (brandTotals[it.brand] ?? 0) + it.purchase_price;
    }
  }
  const byBrand = Object.entries(brandTotals)
    .map(([brand, total]) => ({ brand, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // 착용 빈도 (코디 기록 기반)
  const itemsById: Record<string, Item> = {};
  for (const it of items) itemsById[it.id] = it;
  const outfitById = new Map(outfits.map((o) => [o.id, o]));

  const wear: Record<string, number> = {};
  for (const log of logs) {
    if (!log.outfit_id) continue;
    const o = outfitById.get(log.outfit_id);
    for (const iid of o?.item_ids ?? []) {
      if (itemsById[iid]) wear[iid] = (wear[iid] ?? 0) + 1;
    }
  }

  const topWorn = Object.entries(wear)
    .map(([id, count]) => ({ item: itemsById[id], count }))
    .filter((w) => w.item)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const neverWorn = items
    .filter((it) => it.status === "owned" && !wear[it.id])
    .slice(0, 6);

  return {
    itemCount: items.length,
    outfitCount: outfits.length,
    logCount: logs.length,
    byCategory,
    byColor,
    byBrand,
    topWorn,
    neverWorn,
    styleKeywords: profile?.style_keywords ?? [],
  };
}
