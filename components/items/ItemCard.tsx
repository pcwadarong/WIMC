import Link from "next/link";
import Image from "next/image";
import { Heart, Shirt } from "lucide-react";
import type { Item } from "@/types";
import { ITEM_STATUS_LABELS } from "@/types";
import { primaryImageUrl } from "@/lib/utils/item";
import { css } from "@/styled-system/css";

// 기존 import 경로 호환을 위해 재노출
export { primaryImageUrl } from "@/lib/utils/item";

export function ItemCard({ item }: { item: Item }) {
  const url = primaryImageUrl(item);

  return (
    <Link
      href={`/closet/${item.id}`}
      className={css({ display: "block" })}
    >
      <div
        className={css({
          position: "relative",
          aspectRatio: "1",
          borderRadius: "lg",
          overflow: "hidden",
          bg: "surface.muted",
          boxShadow: "card", // 잉크 아웃라인
        })}
      >
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
        {item.is_favorite && (
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
    </Link>
  );
}
