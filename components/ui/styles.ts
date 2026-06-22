import { css } from "@/styled-system/css";

/** 카드 표면 공통 스타일 (bg/radius/shadow). 패딩은 호출부에서 더한다. */
export const cardSurface = css({
  bg: "surface",
  borderRadius: "md",
  boxShadow: "card",
});

type ChipVariant = "fill" | "outline";
type ChipSize = "sm" | "md";

/**
 * 토글 칩 공통 클래스. active/variant/size를 정적 분기로 처리(Panda 추출 가능).
 * - fill: 선택 시 brown 배경(탭/필터)
 * - outline: 선택 시 테두리 강조(다중 선택)
 */
export function chipClass({
  active = false,
  variant = "outline",
  size = "md",
}: { active?: boolean; variant?: ChipVariant; size?: ChipSize } = {}) {
  return css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5",
    flexShrink: 0,
    borderRadius: "full",
    borderWidth: "1.5px",
    borderStyle: "solid",
    cursor: "pointer",
    whiteSpace: "nowrap",
    letterSpacing: "-0.02em",
    transition: "background 0.12s ease, border-color 0.12s ease, color 0.12s ease",
    height: size === "sm" ? "34px" : "40px",
    paddingX: size === "sm" ? "3" : "4",
    fontSize: "sm",
    fontWeight: active ? 600 : variant === "fill" ? 400 : 500,
    bg: variant === "fill" && active ? "brown.dark" : "surface.muted",
    color:
      variant === "fill"
        ? active
          ? "white"
          : "text.secondary"
        : active
          ? "text.primary"
          : "text.secondary",
    borderColor:
      variant === "fill" ? "transparent" : active ? "brown.dark" : "border",
  });
}
