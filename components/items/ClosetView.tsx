"use client";

import { useMemo, useState } from "react";
import { Search, Heart, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { ItemCard } from "@/components/items/ItemCard";
import { SEASON_LABELS, type Season } from "@/types";
import { useItems, useCategories } from "@/lib/queries/hooks";
import { buildCategoryMap } from "@/lib/utils/category";
import { sortItems, ITEM_SORT_LABELS, type ItemSort } from "@/lib/utils/item";
import { chipClass } from "@/components/ui/styles";
import { css } from "@/styled-system/css";

const title = css({ textStyle: "displayMd", color: "text.primary", marginBottom: "4" });

// 카테고리 탭 파스텔(레퍼런스 Courses 폴더). 동적 인덱스 색이라 style 예외.
const CATEGORY_PASTELS = ["#F0D2B4", "#F1CEDA", "#D9CFEC", "#C5D8EC", "#CBE0BD", "#F2DE82"];

const MATERIALS = ["면", "폴리에스터", "울", "아크릴", "나일론", "린넨", "데님", "가죽", "캐시미어"];
const SEASONS = Object.keys(SEASON_LABELS) as Season[];
const SORTS = Object.keys(ITEM_SORT_LABELS) as ItemSort[];

const sheetSectionTitle = css({
  fontSize: "sm",
  fontWeight: 700,
  color: "text.primary",
  marginBottom: "3",
});

export function ClosetView() {
  const { data: items = [], isLoading: itemsLoading } = useItems();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);
  const parents = useMemo(() => categories.map((c) => c.name), [categories]);

  const [cat, setCat] = useState("");
  const [fav, setFav] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [search, setSearch] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
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
        // 위시리스트(구매고민)는 기본 목록에서 분리
        if (wishlist ? it.status !== "wishlist" : it.status === "wishlist")
          return false;
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
        return true;
      }),
    [items, wishlist, cat, fav, search, colors, materials, seasons, categoryMap],
  );

  const sorted = useMemo(() => sortItems(filtered, sort), [filtered, sort]);
  const activeCount = colors.length + materials.length + seasons.length;

  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const resetSheet = () => {
    setColors([]);
    setMaterials([]);
    setSeasons([]);
  };

  if (itemsLoading || catsLoading) {
    return (
      <>
        <h1 className={title}>Closet</h1>
        <div className={css({ marginTop: "4" })}>
          <GridSkeleton />
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <h1 className={title}>Closet</h1>
        <p className={css({ marginTop: "12", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
          아직 등록한 아이템이 없어요. + 버튼으로 추가해보세요.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className={title}>
        {wishlist ? "Wishlist" : "Closet"}
      </h1>

      {/* 검색 + 필터 */}
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
        <button type="button" className={chipClass({ active: !cat, size: "sm" })} onClick={() => setCat("")}>
          전체
        </button>
        {parents.map((p, i) => {
          const on = cat === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setCat(p)}
              aria-pressed={on}
              className={css({
                flexShrink: 0,
                height: "34px",
                paddingX: "3",
                borderRadius: "full",
                borderWidth: "1.5px",
                borderStyle: "solid",
                borderColor: on ? "brown.dark" : "border",
                fontSize: "sm",
                fontWeight: on ? 600 : 500,
                color: "text.primary",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "border-color 0.12s ease",
              })}
              style={{ background: CATEGORY_PASTELS[i % CATEGORY_PASTELS.length] }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* 빠른 필터 + 정렬 */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2",
          marginTop: "3",
        })}
      >
        <div className={css({ display: "flex", gap: "2" })}>
          <button
            type="button"
            onClick={() => setFav((v) => !v)}
            aria-pressed={fav}
            className={chipClass({ active: fav, size: "sm" })}
          >
            <Heart size={14} fill={fav ? "currentColor" : "none"} />
            즐겨찾기
          </button>
          <button
            type="button"
            onClick={() => {
              setWishlist((v) => !v);
              setFav(false);
            }}
            aria-pressed={wishlist}
            className={chipClass({ active: wishlist, size: "sm" })}
          >
            <ShoppingBag size={14} />
            위시리스트
          </button>
        </div>
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
            flexShrink: 0,
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
          {wishlist ? "위시리스트가 비어 있어요. 아이템 상태를 ‘구매고민’으로 등록해보세요." : "조건에 맞는 아이템이 없어요."}
        </p>
      ) : (
        <div
          className={css({
            marginTop: "4",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "4",
          })}
        >
          {sorted.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
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
              {sorted.length}개 보기
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
                    className={chipClass({ active: colors.includes(c.label), size: "sm" })}
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
                <button key={m} type="button" className={chipClass({ active: materials.includes(m), size: "sm" })} onClick={() => toggle(materials, setMaterials, m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className={sheetSectionTitle}>시즌</p>
            <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
              {SEASONS.map((s) => (
                <button key={s} type="button" className={chipClass({ active: seasons.includes(s), size: "sm" })} onClick={() => toggle(seasons, setSeasons, s)}>
                  {SEASON_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
