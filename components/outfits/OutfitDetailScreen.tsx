"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { ItemCard } from "@/components/items/ItemCard";
import { OutfitFavoriteToggle } from "@/components/outfits/OutfitFavoriteToggle";
import { TopBar } from "@/components/layout/TopBar";
import { OverflowMenu } from "@/components/ui/OverflowMenu";
import { Skeleton } from "@/components/ui/Skeleton";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { deleteOutfit } from "@/app/(app)/outfits/actions";
import { useOutfit, useItems } from "@/lib/queries/hooks";
import { indexById } from "@/lib/utils/item";
import type { Item } from "@/types";
import { css } from "@/styled-system/css";

export function OutfitDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: outfit, isLoading } = useOutfit(id);
  const { data: items = [] } = useItems();
  const del = useConfirmDelete({
    title: "이 코디를 삭제할까요?",
    action: () => deleteOutfit(id),
    invalidateKeys: [["outfits"]],
    redirect: "/outfits",
  });

  if (isLoading) {
    return (
      <>
        <TopBar back title="Outfit" />
        <div className={css({ paddingX: "5", paddingTop: "4" })}>
          <Skeleton className={css({ height: "24px", width: "50%", marginBottom: "6" })} />
          <Skeleton className={css({ height: "160px" })} />
        </div>
      </>
    );
  }

  if (!outfit) {
    return (
      <>
        <TopBar back />
        <p className={css({ marginTop: "16", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
          삭제되었거나 없는 코디예요.
        </p>
      </>
    );
  }

  const byId = indexById(items);
  const outfitItems = (outfit.item_ids ?? [])
    .map((iid) => byId[iid])
    .filter(Boolean) as Item[];

  return (
    <>
      <TopBar
        back
        title={outfit.name || "코디"}
        action={
          <>
            <OutfitFavoriteToggle id={outfit.id} initial={outfit.is_favorite} />
            <OverflowMenu
              items={[
                { label: "수정", icon: <Pencil size={17} />, onClick: () => router.push(`/outfits/${outfit.id}/edit`) },
                { label: "삭제", icon: <Trash2 size={17} />, danger: true, onClick: del.run },
              ]}
            />
          </>
        }
      />
      <div className={css({ paddingX: "5", paddingBottom: "10", paddingTop: "4" })}>
        {outfit.memo && (
          <p className={css({ fontSize: "sm", color: "text.secondary", marginBottom: "5" })}>
            {outfit.memo}
          </p>
        )}

        <div
          className={css({
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "4",
          })}
        >
          {outfitItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
