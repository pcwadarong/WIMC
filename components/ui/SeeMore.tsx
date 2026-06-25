import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { css } from "@/styled-system/css";

/** 섹션 헤더 우측의 '더보기' 펠 버튼 (공용) */
export function SeeMore({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={css({
        display: "inline-flex",
        alignItems: "center",
        gap: "1",
        flexShrink: 0,
        height: "30px",
        paddingX: "3",
        borderRadius: "full",
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: "brown.dark",
        bg: "surface",
        fontSize: "xs",
        fontWeight: 600,
        color: "text.primary",
        _hover: { bg: "surface.muted" },
      })}
    >
      {children}
      <ChevronRight size={13} />
    </Link>
  );
}
