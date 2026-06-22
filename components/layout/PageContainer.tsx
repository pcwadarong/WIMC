import type { ReactNode } from "react";
import { css } from "@/styled-system/css";

const container = css({
  paddingX: "5", // 좌우 20px
  paddingTop: "6",
  paddingBottom: "10",
});

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className={container}>{children}</div>;
}
