import Link from "next/link";
import { Check } from "lucide-react";
import { primaryImageUrl } from "@/components/items/ItemCard";
import { FavoriteHeart } from "@/components/ui/FavoriteHeart";
import { Thumb } from "@/components/ui/Thumb";
import type { Item, Outfit } from "@/types";
import { css } from "@/styled-system/css";

interface OutfitCardProps {
  outfit: Outfit;
  itemsById: Record<string, Item>;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onToggleFavorite?: (id: string, next: boolean) => void;
  heartSize?: number;
}

export function OutfitCard({
  outfit,
  itemsById,
  selectionMode,
  selected,
  onSelect,
  onToggleFavorite,
  heartSize = 24,
}: OutfitCardProps) {
  const ids = outfit.item_ids ?? [];
  const images = ids
    .map((id) => itemsById[id])
    .filter(Boolean)
    .map((it) => primaryImageUrl(it))
    .filter(Boolean) as string[];
  const cells = images.slice(0, 4);

  const collage =
    cells.length > 0 ? (
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
        {cells.map((url, i) => (
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              loading="lazy"
              decoding="async"
              className={css({ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" })}
            />
          </div>
        ))}
      </div>
    ) : undefined;

  const visual = (
    <>
      <Thumb
        radius="lg"
        outlined
        selected={selectionMode && selected}
        content={collage}
      >
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

        {!selectionMode && (
          <FavoriteHeart
            active={outfit.is_favorite}
            size={heartSize}
            onToggle={onToggleFavorite ? (next) => onToggleFavorite(outfit.id, next) : undefined}
          />
        )}
      </Thumb>

      <div className={css({ marginTop: "2" })}>
        <p
          className={css({
            fontSize: "sm",
            fontWeight: 500,
            color: "text.primary",
            letterSpacing: "-0.02em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          })}
        >
          {outfit.name || "이름 없는 코디"}
        </p>
        <p className={css({ fontSize: "xs", color: "text.tertiary", minHeight: "1em" })}>
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
