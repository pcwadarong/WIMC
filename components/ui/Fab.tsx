import Link from "next/link";
import { Plus } from "lucide-react";
import { css } from "@/styled-system/css";

/** 우측 하단 플로팅 추가 버튼 (430px 칼럼 안쪽 정렬) */
export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={css({
        position: "fixed",
        right: "max(20px, calc(50vw - 215px + 20px))",
        bottom: "calc(var(--bottom-nav-height) + 16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        borderRadius: "full",
        bg: "brown.dark",
        color: "white",
        boxShadow: "modal",
        zIndex: 30,
        _hover: { bg: "brown.mid" },
        _active: { transform: "scale(0.95)" },
      })}
    >
      <Plus size={26} />
    </Link>
  );
}
