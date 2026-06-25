import type { SelectHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { fieldStyle } from "@/components/ui/styles";
import { css, cx } from "@/styled-system/css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

const labelStyle = css({
  display: "block",
  marginBottom: "2",
  fontSize: "sm",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  color: "text.secondary",
});

const control = cx(
  fieldStyle,
  css({ height: "52px", paddingX: "4", paddingRight: "10", appearance: "none", cursor: "pointer" }),
);

export function Select({ label, id, className, children, ...props }: SelectProps) {
  return (
    <div className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={id} className={labelStyle}>
          {label}
        </label>
      )}
      <div className={css({ position: "relative", width: "100%" })}>
        <select id={id} className={cx(control, className)} {...props}>
          {children}
        </select>
        <ChevronDown
          size={18}
          className={css({
            position: "absolute",
            right: "3",
            top: "50%",
            transform: "translateY(-50%)",
            color: "text.secondary",
            pointerEvents: "none",
          })}
        />
      </div>
    </div>
  );
}
