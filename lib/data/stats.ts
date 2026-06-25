import "server-only";
import { getItems } from "@/lib/data/items";
import { getOutfits } from "@/lib/data/outfits";
import { getAllLogs } from "@/lib/data/logs";
import { getCategoryTree } from "@/lib/data/categories";
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
export interface CostPerWearRow {
  item: Item;
  cpw: number;
  wears: number;
}
export interface MonthSpend {
  month: string; // YYYY-MM
  total: number;
}

export interface Stats {
  month: string; // 이번 달 YYYY-MM
  itemCount: number;
  outfitCount: number;
  logCount: number;
  monthSpend: number; // 이번 달 지출 (구매일 있는 것만)
  byCategory: CountRow[];
  byColor: CountRow[];
  byBrand: BrandRow[]; // 이번 달
  topWorn: WearRow[]; // 이번 달 많이 입은 Top3
  wornKeywords: CountRow[]; // 이번 달 입은 옷 기반 키워드
  costPerWear: CostPerWearRow[];
  monthlySpend: MonthSpend[];
}

export async function getStats(): Promise<Stats> {
  const [items, outfits, logs, categories] = await Promise.all([
    getItems(),
    getOutfits(),
    getAllLogs(),
    getCategoryTree(),
  ]);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

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

  // 이번 달 지출 + 브랜드별 (구매일 없는 건 제외)
  let monthSpend = 0;
  const brandTotals: Record<string, number> = {};
  for (const it of items) {
    if (it.purchase_date?.startsWith(ym) && it.purchase_price) {
      monthSpend += it.purchase_price;
      if (it.brand) brandTotals[it.brand] = (brandTotals[it.brand] ?? 0) + it.purchase_price;
    }
  }
  const byBrand = Object.entries(brandTotals)
    .map(([brand, total]) => ({ brand, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // 착용 빈도: 전체(가성비용) + 이번 달(Top3용)
  const itemsById: Record<string, Item> = {};
  for (const it of items) itemsById[it.id] = it;
  const outfitById = new Map(outfits.map((o) => [o.id, o]));

  const wear: Record<string, number> = {};
  const wearMonth: Record<string, number> = {};
  for (const log of logs) {
    if (!log.outfit_id) continue;
    const o = outfitById.get(log.outfit_id);
    for (const iid of o?.item_ids ?? []) {
      if (!itemsById[iid]) continue;
      wear[iid] = (wear[iid] ?? 0) + 1;
      if (log.date.startsWith(ym)) wearMonth[iid] = (wearMonth[iid] ?? 0) + 1;
    }
  }

  const topWorn = Object.entries(wearMonth)
    .map(([id, count]) => ({ item: itemsById[id], count }))
    .filter((w) => w.item)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 이번 달 입은 옷 기반 키워드 (옷 단위 집계)
  const kwCounts: Record<string, number> = {};
  for (const id of Object.keys(wearMonth)) {
    const it = itemsById[id];
    for (const k of it?.keywords ?? []) kwCounts[k] = (kwCounts[k] ?? 0) + 1;
  }
  const wornKeywords = Object.entries(kwCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 착용당 비용 (가성비: 착용한 옷 중 cpw 낮은 순) — 전체 기준
  const costPerWear = items
    .filter((it) => it.purchase_price && wear[it.id] > 0)
    .map((it) => ({
      item: it,
      wears: wear[it.id],
      cpw: Math.round((it.purchase_price as number) / wear[it.id]),
    }))
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 5);

  // 월별 지출 추이 (최근 12개월)
  const spendByMonth: Record<string, number> = {};
  for (const it of items) {
    if (it.purchase_date && it.purchase_price) {
      const m = it.purchase_date.slice(0, 7);
      spendByMonth[m] = (spendByMonth[m] ?? 0) + it.purchase_price;
    }
  }
  const monthlySpend = Object.entries(spendByMonth)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  return {
    month: ym,
    itemCount: items.length,
    outfitCount: outfits.length,
    logCount: logs.length,
    monthSpend,
    byCategory,
    byColor,
    byBrand,
    topWorn,
    wornKeywords,
    costPerWear,
    monthlySpend,
  };
}
