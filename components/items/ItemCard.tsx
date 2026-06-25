import Link from "next/link";
import { Check } from "lucide-react";
import type { Item } from "@/types";
import { ITEM_STATUS_LABELS } from "@/types";
import { FavoriteHeart } from "@/components/ui/FavoriteHeart";
import { Thumb } from "@/components/ui/Thumb";
import { primaryImageUrl } from "@/lib/utils/item";
import { css } from "@/styled-system/css";

// 기존 import 경로 호환을 위해 재노출
export { primaryImageUrl } from "@/lib/utils/item";

interface ItemCardProps {
  item: Item;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  /** 제공 시 이미지 우하단 즐겨찾기 토글 버튼 노출 */
  onToggleFavorite?: (id: string, next: boolean) => void;
  /** 하트 아이콘 크기 (작은 그리드의 표시용엔 작게) */
  heartSize?: number;
}

export function ItemCard({
  item,
  selectionMode,
  selected,
  onSelect,
  onToggleFavorite,
  heartSize = 24,
}: ItemCardProps) {
  const url = primaryImageUrl(item);

  const visual = (
    <>
      <Thumb
        src={url}
        alt={item.name}
        radius="lg"
        outlined
        selected={selectionMode && selected}
        iconSize={32}
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

        {/* 즐겨찾기: 핸들러 있으면 토글, 없으면 즐겨찾기일 때만 표시 */}
        {!selectionMode && (
          <FavoriteHeart
            active={item.is_favorite}
            size={heartSize}
            onToggle={onToggleFavorite ? (next) => onToggleFavorite(item.id, next) : undefined}
          />
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
          {item.name}
        </p>
        <p className={css({ fontSize: "xs", color: "text.tertiary", minHeight: "1em" })}>
          {item.brand || " "}
        </p>
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
