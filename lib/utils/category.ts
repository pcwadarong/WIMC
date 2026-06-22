import type { CategoryNode } from "@/types";
import type { CategoryMap } from "@/lib/recommend";

/** 카테고리 트리 → {id: {name, parentName}} 맵 (추천/필터/표시용) */
export function buildCategoryMap(categories: CategoryNode[]): CategoryMap {
  const map: CategoryMap = {};
  for (const p of categories) {
    map[p.id] = { name: p.name, parentName: null };
    for (const c of p.children) {
      map[c.id] = { name: c.name, parentName: p.name };
    }
  }
  return map;
}
