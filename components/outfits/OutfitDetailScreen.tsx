"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { ItemCard } from "@/components/items/ItemCard";
import { DeleteOutfitButton } from "@/components/outfits/DeleteOutfitButton";
import { TopBar } from "@/components/layout/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { iconAction } from "@/components/ui/styles";
import { useOutfit, useItems } from "@/lib/queries/hooks";
import { indexById } from "@/lib/utils/item";
import type { Item } from "@/types";
import { css } from "@/styled-system/css";

export function OutfitDetailScreen({ id }: { id: string }) {
  const { data: outfit, isLoading } = useOutfit(id);
  const { data: items = [] } = useItems();

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
            <Link href={`/outfits/${outfit.id}/edit`} aria-label="수정" className={iconAction}>
              <Pencil size={19} />
            </Link>
            <DeleteOutfitButton id={outfit.id} />
          </>
        }
      />
      <div className={css({ paddingX: "5", paddingBottom: "10", paddingTop: "2" })}>
        {outfit.memo && (
          <p className={css({ fontSize: "sm", color: "text.secondary" })}>
            {outfit.memo}
          </p>
        )}

        <div
          className={css({
            marginTop: outfit.memo ? "5" : "1",
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
