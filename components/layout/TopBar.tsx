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
        display: "grid",
        gridTemplateColumns: "44px 1fr 44px",
        alignItems: "center",
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
        <span />
      )}

      <h1
        className={css({
          textAlign: "center",
          textStyle: "lg",
          fontWeight: 600,
          color: "text.primary",
        })}
      >
        {title}
      </h1>

      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        {action}
      </div>
    </header>
  );
}
