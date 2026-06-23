import { css } from "@/styled-system/css";

/** 카드 표면 공통 스타일 (bg/radius/shadow). 패딩은 호출부에서 더한다. */
export const cardSurface = css({
  bg: "surface",
  borderRadius: "md",
  boxShadow: "outline", // 에디토리얼: 또렷한 잉크 아웃라인
});

/** 입력/셀렉트/텍스트영역 공통 필드 (각진·다크그레이 보더·블랙 포커스). 높이/패딩은 호출부에서. */
export const fieldStyle = css({
  width: "100%",
  bg: "surface",
  borderRadius: "xs",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  fontFamily: "sans",
  fontSize: "base",
  color: "text.primary",
  transition: "border-color 0.15s ease, outline 0.1s ease",
  _placeholder: { color: "text.tertiary" },
  _focusVisible: {
    outline: "2px solid token(colors.border.focus)",
    outlineOffset: "0",
    borderColor: "border.focus",
  },
});

type ChipSize = "sm" | "md";

/** 토글 칩 공통 클래스. 활성 = 파스텔(옐로) + 잉크 아웃라인. */
export function chipClass({
  active = false,
  size = "md",
}: { active?: boolean; size?: ChipSize } = {}) {
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
    fontWeight: active ? 600 : 500,
    // 드로잉 느낌: 활성은 파스텔(옐로) 채움 + 잉크 아웃라인(레퍼런스 the edit)
    bg: active ? "accent.yellow" : "surface.muted",
    color: active ? "text.primary" : "text.secondary",
    borderColor: active ? "brown.dark" : "border",
  });
}
