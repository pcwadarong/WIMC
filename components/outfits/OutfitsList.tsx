"use client";

import { useMemo, useState } from "react";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { useOutfits, useItems } from "@/lib/queries/hooks";
import { indexById } from "@/lib/utils/item";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { css } from "@/styled-system/css";

type OutfitSort = "recent" | "oldest" | "name";
const SORTS: { key: OutfitSort; label: string }[] = [
  { key: "recent", label: "최근순" },
  { key: "oldest", label: "오래된순" },
  { key: "name", label: "이름순" },
];

export function OutfitsList() {
  const { data: outfits = [], isLoading } = useOutfits();
  const { data: items = [] } = useItems();
  const itemsById = useMemo(() => indexById(items), [items]);
  const [sort, setSort] = useState<OutfitSort>("recent");

  const sorted = useMemo(() => {
    const arr = [...outfits];
    if (sort === "oldest") return arr.reverse();
    if (sort === "name")
      return arr.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ko"));
    return arr;
  }, [outfits, sort]);

  if (isLoading) return <GridSkeleton />;

  if (outfits.length === 0) {
    return (
      <p className={css({ marginTop: "12", textAlign: "center", color: "text.tertiary", fontSize: "sm" })}>
        아직 만든 코디가 없어요. + 버튼으로 옷을 조합해보세요.
      </p>
    );
  }

  return (
    <>
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "3",
        })}
      >
        <span className={css({ fontSize: "sm", color: "text.tertiary" })}>
          {sorted.length}개
        </span>
        <select
          aria-label="정렬"
          value={sort}
          onChange={(e) => setSort(e.target.value as OutfitSort)}
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
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "5",
          rowGap: "6",
        })}
      >
        {sorted.map((o) => (
          <OutfitCard key={o.id} outfit={o} itemsById={itemsById} />
        ))}
      </div>
    </>
  );
}
