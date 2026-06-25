import type { TextareaHTMLAttributes } from "react";
import { fieldStyle } from "@/components/ui/styles";
import { css, cx } from "@/styled-system/css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const labelStyle = css({
  display: "block",
  marginBottom: "2",
  fontSize: "sm",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  color: "text.secondary",
});

const area = cx(
  fieldStyle,
  css({ paddingX: "4", paddingY: "3", lineHeight: "1.6", resize: "vertical" }),
);

export function Textarea({ label, id, className, ...props }: TextareaProps) {
  return (
    <div className={css({ width: "100%" })}>
      {label && (
        <label htmlFor={id} className={labelStyle}>
          {label}
        </label>
      )}
      <textarea id={id} className={cx(area, className)} {...props} />
    </div>
  );
}
