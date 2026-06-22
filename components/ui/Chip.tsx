import type { ButtonHTMLAttributes, ReactNode } from "react";
import { chipClass } from "@/components/ui/styles";
import { cx } from "@/styled-system/css";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: "fill" | "outline";
  size?: "sm" | "md";
  children: ReactNode;
}

/** 토글 칩 버튼 (탭/필터/다중선택 공통) */
export function Chip({
  active = false,
  variant = "outline",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      className={cx(chipClass({ active, variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
