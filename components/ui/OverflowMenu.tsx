"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { iconAction } from "@/components/ui/styles";
import { css, cx } from "@/styled-system/css";

export interface OverflowItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

const menu = css({
  position: "absolute",
  top: "calc(100% + 9px)",
  right: "0",
  zIndex: 50,
  minWidth: "164px",
  display: "flex",
  flexDirection: "column",
  paddingY: "1",
  bg: "surface",
  borderRadius: "md",
  boxShadow: "card",
  animation: "fadeIn 0.1s ease",
});
const menuItem = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  width: "100%",
  height: "44px",
  paddingX: "4",
  fontSize: "sm",
  fontWeight: 500,
  color: "text.primary",
  textAlign: "left",
  cursor: "pointer",
  _hover: { bg: "surface.muted" },
});
const dangerItem = css({ color: "error" });

/** 미트볼(⋯) 오버플로 메뉴 — 상세 헤더의 보조 액션(수정/삭제 등) 모음. */
export function OverflowMenu({
  items,
  label = "더보기",
}: {
  items: OverflowItem[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={css({ position: "relative" })}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={iconAction}
      >
        <MoreHorizontal size={22} />
      </button>
      {open && (
        <div role="menu" className={menu}>
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={cx(menuItem, it.danger && dangerItem)}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
