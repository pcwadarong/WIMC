"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { css } from "@/styled-system/css";

interface TopBarProps {
  title?: string;
  back?: boolean;
  /** 우측 액션 영역 */
  action?: ReactNode;
}

export function TopBar({ title, back, action }: TopBarProps) {
  const router = useRouter();

  return (
    <header
      className={css({
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "52px",
        paddingX: "2",
        bg: "bg",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "border",
      })}
    >
      {back ? (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            color: "text.primary",
            cursor: "pointer",
          })}
        >
          <ChevronLeft size={24} />
        </button>
      ) : (
        <span className={css({ width: "44px", flexShrink: 0 })} />
      )}

      {/* 제목은 항상 화면 정중앙 — 좌우 액션 폭과 무관 (넘치면 말줄임) */}
      <h1
        className={css({
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "calc(100% - 160px)",
          textAlign: "center",
          textStyle: "lg",
          fontWeight: 600,
          color: "text.primary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        })}
      >
        {title}
      </h1>

      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.5",
          minWidth: "44px",
        })}
      >
        {action}
      </div>
    </header>
  );
}
