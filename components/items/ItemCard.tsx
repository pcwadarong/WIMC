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
  /** 제공 시 이미지 우하단 즐겨찾기 토글 버튼 노출 */
  onToggleFavorite?: (id: string, next: boolean) => void;
}

const heartBtn = css({
  position: "absolute",
  bottom: "2",
  right: "2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  borderRadius: "full",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "brown.dark",
  bg: "transparent",
  color: "brown.dark",
  cursor: "pointer",
});
// 즐겨찾기일 때만 아이콘 배경 보라색
const heartActive = css({ bg: "accent.lavender" });

export function ItemCard({
  item,
  selectionMode,
  selected,
  onSelect,
  onToggleFavorite,
}: ItemCardProps) {
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

        {/* 즐겨찾기: 핸들러 있으면 토글, 없으면 즐겨찾기일 때만 표시 */}
        {!selectionMode &&
          (onToggleFavorite ? (
            <button
              type="button"
              aria-label={item.is_favorite ? "즐겨찾기 해제" : "즐겨찾기"}
              aria-pressed={item.is_favorite}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(item.id, !item.is_favorite);
              }}
              className={cx(heartBtn, item.is_favorite && heartActive)}
            >
              <Heart size={16} fill={item.is_favorite ? "currentColor" : "none"} />
            </button>
          ) : (
            item.is_favorite && (
              <span className={cx(heartBtn, heartActive)}>
                <Heart size={16} fill="currentColor" />
              </span>
            )
          ))}

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
