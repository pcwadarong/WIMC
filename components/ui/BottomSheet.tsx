"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { css } from "@/styled-system/css";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        bg: "scrim",
        animation: "fadeIn 0.15s ease",
      })}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={css({
          width: "100%",
          maxWidth: "app",
          marginX: "auto",
          maxHeight: "85dvh",
          display: "flex",
          flexDirection: "column",
          bg: "surface",
          borderTopRadius: "lg",
          boxShadow: "modal",
          animation: "sheetUp 0.22s ease",
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingX: "5",
            paddingY: "4",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "border",
          })}
        >
          <h2 className={css({ textStyle: "lg", fontWeight: 700, color: "text.primary" })}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={css({ color: "text.tertiary", cursor: "pointer" })}
          >
            <X size={22} />
          </button>
        </div>

        <div className={css({ overflowY: "auto", paddingX: "5", paddingY: "5" })}>
          {children}
        </div>

        {footer && (
          <div
            className={css({
              paddingX: "5",
              paddingY: "3",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "border",
            })}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
