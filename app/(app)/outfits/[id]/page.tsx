import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getOutfit } from "@/lib/data/outfits";
import { getItems } from "@/lib/data/items";
import { ItemCard } from "@/components/items/ItemCard";
import { DeleteOutfitButton } from "@/components/outfits/DeleteOutfitButton";
import { TopBar } from "@/components/layout/TopBar";
import type { Item } from "@/types";
import { css } from "@/styled-system/css";

export default async function OutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outfit = await getOutfit(id);
  if (!outfit) notFound();

  const items = await getItems();
  const byId: Record<string, Item> = {};
  for (const it of items) byId[it.id] = it;
  const outfitItems = (outfit.item_ids ?? [])
    .map((iid) => byId[iid])
    .filter(Boolean) as Item[];

  return (
    <>
      <TopBar back title={outfit.name || "코디"} />
      <div className={css({ paddingX: "5", paddingBottom: "10" })}>
        <h1
          className={css({
            textStyle: "2xl",
            fontWeight: 700,
            color: "text.primary",
            marginTop: "4",
          })}
        >
          {outfit.name || "이름 없는 코디"}
        </h1>
        {outfit.memo && (
          <p className={css({ marginTop: "2", fontSize: "sm", color: "text.secondary" })}>
            {outfit.memo}
          </p>
        )}

        <div
          className={css({
            marginTop: "6",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "4",
          })}
        >
          {outfitItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        <div
          className={css({
            marginTop: "8",
            display: "flex",
            flexDirection: "column",
            gap: "3",
          })}
        >
          <Link
            href={`/outfits/${outfit.id}/edit`}
            className={css({
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2",
              height: "52px",
              borderRadius: "full",
              bg: "surface.muted",
              color: "text.primary",
              fontSize: "base",
              fontWeight: 600,
              _hover: { bg: "border" },
            })}
          >
            <Pencil size={18} />
            수정
          </Link>
          <DeleteOutfitButton id={outfit.id} />
        </div>
      </div>
    </>
  );
}
