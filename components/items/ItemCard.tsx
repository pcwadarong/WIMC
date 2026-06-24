import Link from "next/link";
import Image from "next/image";
import { Heart, Shirt, Check } from "lucide-react";
import type { Item } from "@/types";
import { ITEM_STATUS_LABELS } from "@/types";
import { primaryImageUrl } from "@/lib/utils/item";
import { css, cx } from "@/styled-system/css";

// 기존 import 경로 호환을 위해 재노출
export { primaryImageUrl } from "@/lib/utils/item";

const imgWrap = css({
  position: "relative",
  aspectRatio: "1",
  borderRadius: "lg",
  overflow: "hidden",
  bg: "surface.muted",
  boxShadow: "card", // 잉크 아웃라인
});

const imgWrapSelected = css({
  boxShadow: "0 0 0 2.5px token(colors.brown.dark)",
});

interface ItemCardProps {
  item: Item;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function ItemCard({ item, selectionMode, selected, onSelect }: ItemCardProps) {
  const url = primaryImageUrl(item);

  const visual = (
    <>
      <div className={cx(imgWrap, selectionMode && selected && imgWrapSelected)}>
        {url ? (
          <Image
            src={url}
            alt={item.name}
            fill
            sizes="(max-width: 430px) 50vw, 215px"
            className={css({ objectFit: "cover" })}
          />
        ) : (
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.tertiary",
            })}
          >
            <Shirt size={32} strokeWidth={1.5} />
          </div>
        )}

        {selectionMode ? (
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
        ) : (
          item.is_favorite && (
            <span
              className={css({
                position: "absolute",
                top: "2",
                right: "2",
                color: "white",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
              })}
            >
              <Heart size={18} fill="currentColor" />
            </span>
          )
        )}

        {item.status && item.status !== "owned" && (
          <span
            className={css({
              position: "absolute",
              top: "2",
              left: "2",
              paddingX: "1.5",
              paddingY: "0.5",
              borderRadius: "full",
              bg: "overlayStrong",
              color: "white",
              fontSize: "xs",
              fontWeight: 600,
            })}
          >
            {ITEM_STATUS_LABELS[item.status]}
          </span>
        )}
      </div>

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
          {item.name}
        </p>
        {item.brand && (
          <p className={css({ fontSize: "xs", color: "text.tertiary" })}>
            {item.brand}
          </p>
        )}
      </div>
    </>
  );

  if (selectionMode) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(item.id)}
        aria-pressed={selected}
        className={css({ display: "block", width: "100%", textAlign: "left", cursor: "pointer" })}
      >
        {visual}
      </button>
    );
  }

  return (
    <Link href={`/closet/${item.id}`} className={css({ display: "block" })}>
      {visual}
    </Link>
  );
}
