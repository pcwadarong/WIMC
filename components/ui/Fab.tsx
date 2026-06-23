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
        bottom: "calc(env(safe-area-inset-bottom) + 90px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        borderRadius: "full",
        bg: "accent.yellow", // 파스텔 포인트 + 잉크 아웃라인
        color: "brown.dark",
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: "brown.dark",
        boxShadow: "modal",
        zIndex: 30,
        _active: { transform: "scale(0.95)" },
      })}
    >
      <Plus size={26} />
    </Link>
  );
}
