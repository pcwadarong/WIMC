import type { ButtonHTMLAttributes, ReactNode } from "react";
import { css, cx } from "@/styled-system/css";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const base = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  fontFamily: "sans",
  fontWeight: 600,
  letterSpacing: "-0.02em",
  borderRadius: "xs", // 거의 각진(최소)
  cursor: "pointer",
  transition: "background 0.15s ease, opacity 0.15s ease, transform 0.1s ease",
  whiteSpace: "nowrap",
  _active: { transform: "scale(0.98)" },
  _focusVisible: { outline: "2px solid token(colors.border.focus)", outlineOffset: "2px" },
  _disabled: { opacity: 0.5, cursor: "not-allowed", _active: { transform: "none" } },
});

const variants: Record<Variant, string> = {
  primary: css({
    bg: "brown.dark",
    color: "surface",
    _hover: { bg: "brown.mid" },
  }),
  secondary: css({
    bg: "surface.muted",
    color: "text.primary",
    _hover: { bg: "accent.green" },
  }),
  ghost: css({
    bg: "transparent",
    color: "text.secondary",
    _hover: { color: "text.primary" },
  }),
};

const sizes: Record<Size, string> = {
  md: css({ height: "44px", paddingX: "5", fontSize: "sm" }),
  lg: css({ height: "52px", paddingX: "6", fontSize: "base" }),
};

/** 버튼 클래스 (anchor 등 다른 태그에도 적용 가능 — Link를 버튼처럼 쓸 때) */
export function buttonClass({
  variant = "primary",
  size = "lg",
  fullWidth = false,
}: { variant?: Variant; size?: Size; fullWidth?: boolean } = {}) {
  return cx(base, variants[variant], sizes[size], fullWidth && css({ width: "100%" }));
}

export function Button({
  variant = "primary",
  size = "lg",
  fullWidth,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonClass({ variant, size, fullWidth }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
