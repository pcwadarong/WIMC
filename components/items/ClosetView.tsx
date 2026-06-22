"use client";

import { useMemo, useState } from "react";
import { Search, Heart, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ClosetGrid } from "@/components/items/ClosetGrid";
import {
  SEASON_LABELS,
  ITEM_STATUS_LABELS,
  type Season,
  type ItemStatus,
  type Item,
} from "@/types";
import type { CategoryMap } from "@/lib/recommend";
import { sortItems, ITEM_SORT_LABELS, type ItemSort } from "@/lib/utils/item";
import { chipClass } from "@/components/ui/styles";
import { css } from "@/styled-system/css";

const SORTS = Object.keys(ITEM_SORT_LABELS) as ItemSort[];

const MATERIALS = ["면", "폴리에스터", "울", "아크릴", "나일론", "린넨", "데님", "가죽", "캐시미어"];
const SEASONS = Object.keys(SEASON_LABELS) as Season[];
const STATUSES = Object.keys(ITEM_STATUS_LABELS) as ItemStatus[];

const chip = (active: boolean) => chipClass({ active, variant: "fill", size: "sm" });
const sheetChip = (active: boolean) => chipClass({ active, variant: "outline", size: "sm" });

const sheetSectionTitle = css({
  fontSize: "sm",
  fontWeight: 700,
  color: "text.primary",
  marginBottom: "3",
});

export function ClosetView({
  items,
  categoryMap,
  parents,
  profileNote,
}: {
  items: Item[];
  categoryMap: CategoryMap;
  parents: string[];
  profileNote?: string;
}) {
  const [cat, setCat] = useState("");
  const [fav, setFav] = useState(false);
  const [search, setSearch] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [statuses, setStatuses] = useState<ItemStatus[]>([]);
  const [sort, setSort] = useState<ItemSort>("recent");
  const [sheetOpen, setSheetOpen] = useState(false);

  const presentColors = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of items)
      for (const c of it.colors ?? []) if (!map.has(c.label)) map.set(c.label, c.hex);
    return [...map.entries()].map(([label, hex]) => ({ label, hex }));
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        if (cat) {
          const pn = it.category_id ? categoryMap[it.category_id]?.parentName : undefined;
          if (pn !== cat) return false;
        }
        if (fav && !it.is_favorite) return false;
        if (search.trim() && !it.name.toLowerCase().includes(search.trim().toLowerCase()))
          return false;
        if (colors.length && !(it.colors ?? []).some((c) => colors.includes(c.label)))
          return false;
        if (materials.length && !materials.some((m) => (it.material ?? "").includes(m)))
          return false;
        if (seasons.length && !(it.season && seasons.includes(it.season))) return false;
        if (statuses.length && !statuses.includes(it.status)) return false;
        return true;
      }),
    [items, cat, fav, search, colors, materials, seasons, statuses, categoryMap],
  );

  const sorted = useMemo(() => sortItems(filtered, sort), [filtered, sort]);

  const activeCount = colors.length + materials.length + seasons.length + statuses.length;

  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const resetSheet = () => {
    setColors([]);
    setMaterials([]);
    setSeasons([]);
    setStatuses([]);
  };

  return (
    <>
      {/* 헤더 */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "4",
        })}
      >
        <h1 className={css({ textStyle: "2xl", fontWeight: 700, color: "text.primary" })}>
          옷장
        </h1>
        <button
          type="button"
          onClick={() => setFav((v) => !v)}
          aria-pressed={fav}
          aria-label="즐겨찾기만 보기"
          className={chip(fav)}
        >
          <Heart size={15} fill={fav ? "currentColor" : "none"} />
          즐겨찾기
        </button>
      </div>

      {/* 검색 + 필터 버튼 */}
      <div className={css({ display: "flex", gap: "2", marginBottom: "3" })}>
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "2",
            flex: 1,
            height: "44px",
            paddingX: "3",
            bg: "surface.muted",
            borderRadius: "sm",
          })}
        >
          <Search size={18} className={css({ color: "text.tertiary" })} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름으로 검색"
            aria-label="아이템 이름 검색"
            className={css({
              flex: 1,
              minWidth: 0,
              bg: "transparent",
              fontSize: "base",
              color: "text.primary",
              _placeholder: { color: "text.tertiary" },
              _focusVisible: { outline: "none" },
            })}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="지우기" className={css({ color: "text.tertiary", cursor: "pointer" })}>
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "1.5",
            height: "44px",
            paddingX: "4",
            borderRadius: "sm",
            fontSize: "sm",
            fontWeight: 600,
            cursor: "pointer",
            bg: activeCount > 0 ? "brown.dark" : "surface.muted",
            color: activeCount > 0 ? "white" : "text.secondary",
          })}
        >
          <SlidersHorizontal size={16} />
          필터{activeCount > 0 ? ` ${activeCount}` : ""}
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div
        className={css({
          display: "flex",
          gap: "2",
          overflowX: "auto",
          paddingBottom: "1",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        })}
      >
        <button type="button" className={chip(!cat)} onClick={() => setCat("")}>
          전체
        </button>
        {parents.map((p) => (
          <button key={p} type="button" className={chip(cat === p)} onClick={() => setCat(p)}>
            {p}
          </button>
        ))}
      </div>

      {/* 개수 + 정렬 */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "4",
          marginBottom: "1",
        })}
      >
        <span className={css({ fontSize: "sm", color: "text.tertiary" })}>
          {sorted.length}개
        </span>
        <select
          aria-label="정렬"
          value={sort}
          onChange={(e) => setSort(e.target.value as ItemSort)}
          className={css({
            height: "32px",
            paddingX: "2",
            bg: "transparent",
            fontSize: "sm",
            color: "text.secondary",
            cursor: "pointer",
            _focusVisible: { outline: "none" },
          })}
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {ITEM_SORT_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* 결과 */}
      {sorted.length === 0 ? (
        <p className={css({ marginTop: "10", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
          조건에 맞는 아이템이 없어요.
        </p>
      ) : (
        <ClosetGrid items={sorted} categoryMap={categoryMap} profileNote={profileNote} />
      )}

      {/* 필터 바텀시트 */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="필터"
        footer={
          <div className={css({ display: "flex", gap: "3" })}>
            <Button type="button" variant="secondary" onClick={resetSheet} className={css({ flex: 1 })}>
              초기화
            </Button>
            <Button type="button" onClick={() => setSheetOpen(false)} className={css({ flex: 1 })}>
              {filtered.length}개 보기
            </Button>
          </div>
        }
      >
        <div className={css({ display: "flex", flexDirection: "column", gap: "6" })}>
          {presentColors.length > 0 && (
            <div>
              <p className={sheetSectionTitle}>색상</p>
              <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
                {presentColors.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className={sheetChip(colors.includes(c.label))}
                    onClick={() => toggle(colors, setColors, c.label)}
                  >
                    <span
                      className={css({ width: "14px", height: "14px", borderRadius: "full", borderWidth: "1px", borderStyle: "solid", borderColor: "border" })}
                      style={{ background: c.hex }}
                    />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className={sheetSectionTitle}>소재</p>
            <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
              {MATERIALS.map((m) => (
                <button key={m} type="button" className={sheetChip(materials.includes(m))} onClick={() => toggle(materials, setMaterials, m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className={sheetSectionTitle}>시즌</p>
            <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
              {SEASONS.map((s) => (
                <button key={s} type="button" className={sheetChip(seasons.includes(s))} onClick={() => toggle(seasons, setSeasons, s)}>
                  {SEASON_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className={sheetSectionTitle}>상태</p>
            <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
              {STATUSES.map((s) => (
                <button key={s} type="button" className={sheetChip(statuses.includes(s))} onClick={() => toggle(statuses, setStatuses, s)}>
                  {ITEM_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
