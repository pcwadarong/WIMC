import { Shirt } from "lucide-react";
import type { ReactNode } from "react";
import { css, cx } from "@/styled-system/css";

// 빈 이미지일 때 옷 아이콘으로 통일하는 공용 썸네일 래퍼.
// 사이즈/배치는 parent가 className(width/height/flexShrink 등)으로 제어.

const box = css({
  position: "relative",
  aspectRatio: "1",
  overflow: "hidden",
  bg: "surface.muted",
  display: "grid",
  placeItems: "center",
  color: "text.tertiary",
});
const fill = css({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
});
const shadowCard = css({ boxShadow: "card" });
const shadowRing = css({ boxShadow: "0 0 0 2.5px token(colors.brown.dark)" });

const RADIUS = {
  sm: css({ borderRadius: "sm" }),
  md: css({ borderRadius: "md" }),
  lg: css({ borderRadius: "lg" }),
} as const;

export function Thumb({
  src,
  alt = "",
  radius = "md",
  outlined = false,
  selected = false,
  iconSize = 28,
  content,
  className,
  children,
}: {
  src?: string | null;
  alt?: string;
  radius?: "sm" | "md" | "lg";
  /** 잉크 아웃라인(boxShadow card) */
  outlined?: boolean;
  /** 선택 링 (아웃라인 대체) */
  selected?: boolean;
  iconSize?: number;
  /** 단일 이미지 대신 채울 커스텀 콘텐츠(예: 코디 콜라주). 있으면 src/fallback 대신 사용. */
  content?: ReactNode;
  className?: string;
  /** 체크·하트 등 오버레이 */
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        box,
        RADIUS[radius],
        selected ? shadowRing : outlined && shadowCard,
        className,
      )}
    >
      {content ??
        (src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} loading="lazy" decoding="async" className={fill} />
        ) : (
          <Shirt size={iconSize} strokeWidth={1.5} />
        ))}
      {children}
    </div>
  );
}
