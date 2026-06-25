"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useItem, useCategories, useItemWears } from "@/lib/queries/hooks";
import { ItemDetail } from "@/components/items/ItemDetail";
import { FavoriteToggle } from "@/components/items/FavoriteToggle";
import { TopBar } from "@/components/layout/TopBar";
import { OverflowMenu } from "@/components/ui/OverflowMenu";
import { Skeleton } from "@/components/ui/Skeleton";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { deleteItem } from "@/app/(app)/closet/actions";
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
  const router = useRouter();
  const { data: item, isLoading } = useItem(id);
  const { data: categories = [] } = useCategories();
  const { data: wears } = useItemWears(id);
  const del = useConfirmDelete({
    title: "이 아이템을 삭제할까요?",
    action: () => deleteItem(id),
    invalidateKeys: [["items"], ["stats"]],
    redirect: "/closet",
  });

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
            <OverflowMenu
              items={[
                { label: "수정", icon: <Pencil size={17} />, onClick: () => router.push(`/closet/${item.id}/edit`) },
                { label: "삭제", icon: <Trash2 size={17} />, danger: true, onClick: del.run },
              ]}
            />
          </>
        }
      />
      <ItemDetail item={item} categoryLabel={categoryLabel} wears={wears} />
    </>
  );
}
