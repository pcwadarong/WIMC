"use client";

import { useMemo } from "react";
import { OutfitBuilder } from "@/components/outfits/OutfitBuilder";
import { PageContainer } from "@/components/layout/PageContainer";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { useItems, useCategories, useOutfit } from "@/lib/queries/hooks";
import { buildCategoryMap } from "@/lib/utils/category";
import { css } from "@/styled-system/css";

/** 코디 만들기(새로)/수정 공용 — 데이터 준비 후 OutfitBuilder 렌더 */
export function OutfitBuilderScreen({ outfitId }: { outfitId?: string }) {
  const { data: items = [], isLoading: itemsLoading } = useItems();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: outfit, isLoading: outfitLoading } = useOutfit(outfitId ?? "");

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);
  const parents = useMemo(() => categories.map((c) => c.name), [categories]);

  if (itemsLoading || catsLoading || (outfitId && outfitLoading)) {
    return (
      <PageContainer>
        <GridSkeleton />
      </PageContainer>
    );
  }

  if (outfitId && !outfit) {
    return (
      <PageContainer>
        <p className={css({ marginTop: "10", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
          삭제되었거나 없는 코디예요.
        </p>
      </PageContainer>
    );
  }

  if (items.length === 0) {
    return (
      <PageContainer>
        <p className={css({ marginTop: "10", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
          먼저 옷장에 아이템을 등록해주세요.
        </p>
      </PageContainer>
    );
  }

  return (
    <OutfitBuilder
      items={items}
      categoryMap={categoryMap}
      parents={parents}
      outfitId={outfitId}
      initialName={outfit?.name ?? ""}
      initialSelected={outfit?.item_ids ?? []}
    />
  );
}
