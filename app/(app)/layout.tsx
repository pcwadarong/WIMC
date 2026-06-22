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
});

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={shell}>
      <main className={main}>{children}</main>
      <BottomNav />
    </div>
  );
}
