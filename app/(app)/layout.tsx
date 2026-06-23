import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { css } from "@/styled-system/css";

const shell = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "app", // 430px
  minHeight: "100dvh",
  marginX: "auto",
  bg: "bg",
});

const main = css({
  flex: 1,
  minHeight: 0,
  // floating 네비에 가려지지 않도록 하단 여백 확보
  paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)",
});

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={shell}>
      <main className={main}>{children}</main>
      <BottomNav />
    </div>
  );
}
