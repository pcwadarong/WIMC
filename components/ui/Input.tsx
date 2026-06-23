import type { InputHTMLAttributes } from "react";
import { css, cx } from "@/styled-system/css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const field = css({
  width: "100%",
  height: "52px",
  paddingX: "4",
  bg: "surface",
  borderRadius: "xs", // 거의 각진(최소)
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border", // 기본 = 다크 그레이(또렷)
  fontFamily: "sans",
  fontSize: "base",
  letterSpacing: "-0.025em",
  color: "text.primary",
  transition: "border-color 0.15s ease, outline 0.1s ease",
  _placeholder: { color: "text.tertiary" },
  _focusVisible: {
    outline: "2px solid token(colors.border.focus)", // 포커스 = 블랙
    outlineOffset: "0",
    borderColor: "border.focus",
  },
});

const labelStyle = css({
  display: "block",
  marginBottom: "2",
  fontSize: "sm",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  color: "text.secondary",
});

export function Input({ label, id, className, ...props }: InputProps) {
  return (
    <div className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={id} className={labelStyle}>
          {label}
        </label>
      )}
      <input id={id} className={cx(field, className)} {...props} />
    </div>
  );
}
