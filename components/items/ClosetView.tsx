"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Heart, ShoppingBag, SlidersHorizontal, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { ItemCard } from "@/components/items/ItemCard";
import { useToast } from "@/components/ui/Toast";
import { bulkDeleteItems, bulkSetFavorite } from "@/app/(app)/closet/actions";
import { SEASON_LABELS, type Season } from "@/types";
import { useItems, useCategories } from "@/lib/queries/hooks";
import { buildCategoryMap } from "@/lib/utils/category";
import { sortItems, ITEM_SORT_LABELS, type ItemSort } from "@/lib/utils/item";
import { chipClass } from "@/components/ui/styles";
import { css } from "@/styled-system/css";

const title = css({ textStyle: "displayMd", color: "text.primary", marginBottom: "4" });

const MATERIALS = ["면", "폴리에스터", "울", "아크릴", "나일론", "린넨", "데님", "가죽", "캐시미어"];
const SEASONS = Object.keys(SEASON_LABELS) as Season[];
const SORTS = Object.keys(ITEM_SORT_LABELS) as ItemSort[];

const sheetSectionTitle = css({
  fontSize: "sm",
  fontWeight: 700,
  color: "text.primary",
  marginBottom: "3",
});

// 다중선택 액션바 버튼
const barBtn = (variant: "pink" | "plain" | "danger") =>
  css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5",
    flex: 1,
    height: "42px",
    borderRadius: "full",
    borderWidth: "1.5px",
    borderStyle: "solid",
    fontSize: "sm",
    fontWeight: 600,
    cursor: "pointer",
    borderColor: variant === "danger" ? "error" : "brown.dark",
    bg: variant === "pink" ? "accent.pink" : "surface",
    color: variant === "danger" ? "error" : "text.primary",
    _disabled: { opacity: 0.4, cursor: "not-allowed" },
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

  const queryClient = useQueryClient();
  const { show } = useToast();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exitSelect = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

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

  const allSelected = sorted.length > 0 && sorted.every((it) => selectedIds.has(it.id));
  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(sorted.map((it) => it.id)));

  const runBulk = async (fn: () => Promise<{ ok: true } | { error: string }>, msg: string) => {
    if (selectedIds.size === 0 || busy) return;
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if ("error" in result) {
      show(result.error, "error");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["items"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    show(msg, "success");
    exitSelect();
  };

  const ids = () => [...selectedIds];
  const onDelete = () => {
    if (!confirm(`선택한 ${selectedIds.size}개를 삭제할까요?`)) return;
    runBulk(() => bulkDeleteItems(ids()), "삭제했어요.");
  };
  const onFav = () => runBulk(() => bulkSetFavorite(ids(), true), "즐겨찾기에 추가했어요.");
  const onUnfav = () => runBulk(() => bulkSetFavorite(ids(), false), "즐겨찾기를 해제했어요.");

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
            minWidth: 0,
            height: "44px",
            paddingX: "3",
            bg: "surface",
            borderRadius: "md",
            borderWidth: "1.5px",
            borderStyle: "solid",
            borderColor: "brown.dark",
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
            flexShrink: 0,
            height: "44px",
            paddingX: "4",
            borderRadius: "md",
            borderWidth: "1.5px",
            borderStyle: "solid",
            borderColor: "brown.dark",
            fontSize: "sm",
            fontWeight: 600,
            cursor: "pointer",
            bg: activeCount > 0 ? "accent.green" : "surface",
            color: "text.primary",
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
        {parents.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setCat(p)}
            aria-pressed={cat === p}
            className={chipClass({ active: cat === p, size: "sm" })}
          >
            {p}
          </button>
        ))}
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
            className={chipClass({ active: fav, size: "sm", color: "pink" })}
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
            className={chipClass({ active: wishlist, size: "sm", color: "purple" })}
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

      {/* 선택 모드 컨트롤 */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: selectMode ? "space-between" : "flex-end",
          marginTop: "3",
          minHeight: "26px",
          fontSize: "sm",
        })}
      >
        {selectMode ? (
          <>
            <button type="button" onClick={toggleAll} className={css({ color: "text.secondary", fontWeight: 500, cursor: "pointer" })}>
              {allSelected ? "선택 해제" : "전체 선택"}
            </button>
            <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
              <span className={css({ color: "text.secondary" })}>{selectedIds.size}개</span>
              <button type="button" onClick={exitSelect} className={css({ color: "text.secondary", fontWeight: 600, cursor: "pointer" })}>
                취소
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => setSelectMode(true)} className={css({ color: "text.secondary", fontWeight: 600, cursor: "pointer" })}>
            선택
          </button>
        )}
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
            gap: "5",
            rowGap: "6",
          })}
        >
          {sorted.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              selectionMode={selectMode}
              selected={selectedIds.has(item.id)}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {/* 다중선택 액션 바 */}
      {selectMode && (
        <div
          className={css({
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "calc(env(safe-area-inset-bottom) + 88px)",
            zIndex: 45,
            width: "calc(min(100vw, token(sizes.app)) - 28px)",
            display: "flex",
            gap: "2",
            padding: "2",
            bg: "surface",
            borderRadius: "full",
            boxShadow: "0 0 0 1.5px token(colors.brown.dark), 0 10px 28px rgba(0, 0, 0, 0.14)",
          })}
        >
          <button type="button" onClick={onFav} disabled={selectedIds.size === 0 || busy} className={barBtn("pink")}>
            <Heart size={16} />
            좋아요
          </button>
          <button type="button" onClick={onUnfav} disabled={selectedIds.size === 0 || busy} className={barBtn("plain")}>
            좋아요 해제
          </button>
          <button type="button" onClick={onDelete} disabled={selectedIds.size === 0 || busy} className={barBtn("danger")}>
            <Trash2 size={16} />
            삭제
          </button>
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
