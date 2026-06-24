import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Check } from "lucide-react";
import { primaryImageUrl } from "@/components/items/ItemCard";
import type { Item, Outfit } from "@/types";
import { css, cx } from "@/styled-system/css";

const wrap = css({
  position: "relative",
  aspectRatio: "1",
  borderRadius: "lg",
  overflow: "hidden",
  bg: "surface.muted",
  boxShadow: "card", // 잉크 아웃라인
});

const wrapSelected = css({ boxShadow: "0 0 0 2.5px token(colors.brown.dark)" });

interface OutfitCardProps {
  outfit: Outfit;
  itemsById: Record<string, Item>;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function OutfitCard({
  outfit,
  itemsById,
  selectionMode,
  selected,
  onSelect,
}: OutfitCardProps) {
  const ids = outfit.item_ids ?? [];
  const images = ids
    .map((id) => itemsById[id])
    .filter(Boolean)
    .map((it) => primaryImageUrl(it))
    .filter(Boolean) as string[];
  const cells = images.slice(0, 4);

  const visual = (
    <>
      <div className={cx(wrap, selectionMode && selected && wrapSelected)}>
        <div
          className={css({
            position: "absolute",
            inset: 0,
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

        {selectionMode && (
          <span
            className={css({
              position: "absolute",
              top: "2",
              right: "2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "full",
              borderWidth: "1.5px",
              borderStyle: "solid",
              borderColor: "brown.dark",
              bg: selected ? "accent.green" : "whiteMuted",
              color: "brown.dark",
            })}
          >
            {selected && <Check size={15} strokeWidth={3} />}
          </span>
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
    </>
  );

  if (selectionMode) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(outfit.id)}
        aria-pressed={selected}
        className={css({ display: "block", width: "100%", textAlign: "left", cursor: "pointer" })}
      >
        {visual}
      </button>
    );
  }

  return (
    <Link href={`/outfits/${outfit.id}`} className={css({ display: "block" })}>
      {visual}
    </Link>
  );
}
