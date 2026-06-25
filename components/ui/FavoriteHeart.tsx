"use client";

import { Heart } from "lucide-react";
import { css, cx } from "@/styled-system/css";

// 카드 이미지 우하단 즐겨찾기 하트(공통). 아이콘은 2종(24/15)이고
// 작은 하트는 래퍼를 작게·코너에 더 붙여 우측 하단으로 내린다.
const big = css({
  position: "absolute",
  bottom: "2",
  right: "2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  bg: "transparent",
  color: "like",
});
const small = css({
  position: "absolute",
  bottom: "1",
  right: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
  bg: "transparent",
  color: "like",
});

export function FavoriteHeart({
  active,
  size = 24,
  onToggle,
}: {
  active: boolean;
  /** 24(기본) 또는 15(작은 그리드) */
  size?: number;
  /** 제공 시 토글 버튼, 없으면 즐겨찾기일 때만 표시(비대화) */
  onToggle?: (next: boolean) => void;
}) {
  const cls = size <= 18 ? small : big;
  if (onToggle) {
    return (
      <button
        type="button"
        aria-label={active ? "즐겨찾기 해제" : "즐겨찾기"}
        aria-pressed={active}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(!active);
        }}
        className={cx(cls, css({ cursor: "pointer" }))}
      >
        <Heart size={size} fill={active ? "currentColor" : "none"} />
      </button>
    );
  }
  if (!active) return null;
  return (
    <span className={cls}>
      <Heart size={size} fill="currentColor" />
    </span>
  );
}
