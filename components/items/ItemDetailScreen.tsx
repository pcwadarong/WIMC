"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useItem, useCategories, useItemWears } from "@/lib/queries/hooks";
import { ItemDetail } from "@/components/items/ItemDetail";
import { FavoriteToggle } from "@/components/items/FavoriteToggle";
import { DeleteItemButton } from "@/components/items/DeleteItemButton";
import { TopBar } from "@/components/layout/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { iconAction } from "@/components/ui/styles";
import type { CategoryNode } from "@/types";
import { css } from "@/styled-system/css";

function resolveCategoryLabel(
  categories: CategoryNode[],
  categoryId: string | null,
): string | null {
  if (!categoryId) return null;
  for (const parent of categories) {
    const child = parent.children.find((c) => c.id === categoryId);
    if (child) return `${parent.name} > ${child.name}`;
    if (parent.id === categoryId) return parent.name;
  }
  return null;
}

export function ItemDetailScreen({ id }: { id: string }) {
  const { data: item, isLoading } = useItem(id);
  const { data: categories = [] } = useCategories();
  const { data: wears } = useItemWears(id);

  if (isLoading) {
    return (
      <>
        <TopBar back />
        <div className={css({ paddingX: "5" })}>
          <Skeleton className={css({ aspectRatio: "1", marginBottom: "5" })} />
          <Skeleton className={css({ height: "24px", width: "60%", marginBottom: "3" })} />
          <Skeleton className={css({ height: "16px", width: "40%" })} />
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <TopBar back />
        <p className={css({ marginTop: "16", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
          삭제되었거나 없는 아이템이에요.
        </p>
      </>
    );
  }

  const categoryLabel = resolveCategoryLabel(categories, item.category_id);

  return (
    <>
      <TopBar
        back
        action={
          <>
            <FavoriteToggle id={item.id} initial={item.is_favorite} />
            <Link href={`/closet/${item.id}/edit`} aria-label="수정" className={iconAction}>
              <Pencil size={19} />
            </Link>
            <DeleteItemButton id={item.id} />
          </>
        }
      />
      <ItemDetail item={item} categoryLabel={categoryLabel} wears={wears} />
    </>
  );
}
