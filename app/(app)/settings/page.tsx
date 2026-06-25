import Link from "next/link";
import { KeyRound, LogOut, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { css, cx } from "@/styled-system/css";

// 각 행 = 독립된 잉크 아웃라인 카드
const row = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  width: "100%",
  padding: "4",
  bg: "surface",
  borderRadius: "md",
  boxShadow: "card",
  fontSize: "base",
  fontWeight: 500,
  color: "text.primary",
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.12s ease",
  _hover: { bg: "surface.muted" },
});

const badge = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "34px",
  height: "34px",
  borderRadius: "sm",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "brown.dark",
  color: "brown.dark",
  flexShrink: 0,
});

export default function SettingsPage() {
  return (
    <>
      <TopBar back title="Settings" />
      <div className={css({ paddingX: "5", paddingTop: "5" })}>
        <div className={css({ display: "flex", flexDirection: "column", gap: "2.5" })}>
          <Link href="/account/update-password" className={row}>
            <span className={cx(badge, css({ bg: "accent.yellow" }))}>
              <KeyRound size={17} />
            </span>
            <span className={css({ flex: 1 })}>비밀번호 변경</span>
            <ChevronRight size={18} className={css({ color: "text.tertiary" })} />
          </Link>
          <LogoutButton className={cx(row, css({ color: "error" }))}>
            <span className={cx(badge, css({ bg: "tint.error", borderColor: "error", color: "error" }))}>
              <LogOut size={17} />
            </span>
            <span className={css({ flex: 1 })}>로그아웃</span>
          </LogoutButton>
        </div>

        <p className={css({ marginTop: "6", textAlign: "center", fontSize: "xs", color: "text.tertiary" })}>
          WIMC · v0.1.0
        </p>
      </div>
    </>
  );
}
