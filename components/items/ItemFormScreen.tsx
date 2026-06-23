"use client";

import { useCategories, useItem } from "@/lib/queries/hooks";
import { ItemForm } from "@/components/items/ItemForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "@/styled-system/css";

function FormSkeleton() {
  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "5" })}>
      <Skeleton className={css({ height: "120px" })} />
      <Skeleton className={css({ height: "52px" })} />
      <Skeleton className={css({ height: "52px" })} />
      <Skeleton className={css({ height: "120px" })} />
    </div>
  );
}

/** 아이템 등록(새로)/수정 공용 — 데이터 준비 후 ItemForm 렌더 */
export function ItemFormScreen({ itemId }: { itemId?: string }) {
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: item, isLoading: itemLoading } = useItem(itemId ?? "");

  if (catsLoading || (itemId && itemLoading)) return <FormSkeleton />;

  if (itemId && !item) {
    return (
      <p className={css({ marginTop: "10", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
        삭제되었거나 없는 아이템이에요.
      </p>
    );
  }

  return <ItemForm categories={categories} item={item ?? undefined} />;
}
