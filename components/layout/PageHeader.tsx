import type { ReactNode } from "react";
import { css } from "@/styled-system/css";

// 메인 탭 페이지 제목(공통). 세부 페이지는 TopBar를 쓴다.
// size: "md"(기본) / "lg"(홈 등 큰 제목). 간격은 항상 동일.
export function PageHeader({
  title,
  size = "md",
  action,
}: {
  title: string;
  size?: "md" | "lg";
  action?: ReactNode;
}) {
  return (
    <div
      className={css({
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "3",
        marginBottom: "5",
      })}
    >
      <h1 className={css({ textStyle: size === "lg" ? "displayLg" : "displayMd", color: "text.primary" })}>
        {title}
      </h1>
      {action}
    </div>
  );
}
