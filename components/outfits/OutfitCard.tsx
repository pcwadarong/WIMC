import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { primaryImageUrl } from "@/components/items/ItemCard";
import type { Item, Outfit } from "@/types";
import { css } from "@/styled-system/css";

export function OutfitCard({
  outfit,
  itemsById,
}: {
  outfit: Outfit;
  itemsById: Record<string, Item>;
}) {
  const ids = outfit.item_ids ?? [];
  const images = ids
    .map((id) => itemsById[id])
    .filter(Boolean)
    .map((it) => primaryImageUrl(it))
    .filter(Boolean) as string[];
  const cells = images.slice(0, 4);

  return (
    <Link href={`/outfits/${outfit.id}`} className={css({ display: "block" })}>
      <div
        className={css({
          aspectRatio: "1",
          borderRadius: "lg",
          overflow: "hidden",
          bg: "surface.muted",
          boxShadow: "card", // 잉크 아웃라인
          display: "grid",
          gridTemplateColumns: cells.length > 1 ? "1fr 1fr" : "1fr",
          gridAutoRows: "1fr",
          gap: "1px",
        })}
      >
        {cells.length > 0 ? (
          cells.map((url, i) => (
            <div
              key={i}
              className={css({
                position: "relative",
                width: "100%",
                height: "100%",
                bg: "surface",
                // 3개일 때 첫 칸을 넓게
                gridColumn: cells.length === 3 && i === 0 ? "span 2" : undefined,
              })}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 430px) 50vw, 215px"
                className={css({ objectFit: "cover" })}
              />
            </div>
          ))
        ) : (
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.tertiary",
            })}
          >
            <LayoutGrid size={28} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className={css({ marginTop: "2" })}>
        <p
          className={css({
            fontSize: "sm",
            fontWeight: 500,
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          })}
        >
          {outfit.name || "이름 없는 코디"}
        </p>
        <p className={css({ fontSize: "xs", color: "text.tertiary" })}>
          아이템 {ids.length}개
        </p>
      </div>
    </Link>
  );
}
