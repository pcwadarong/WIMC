import Link from "next/link";
import { KeyRound, Mail, LogOut, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { cardSurface } from "@/components/ui/styles";
import { signOut } from "@/app/(app)/actions";
import { css, cx } from "@/styled-system/css";

const row = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  width: "100%",
  padding: "4",
  bg: "surface",
  fontSize: "base",
  color: "text.primary",
  cursor: "pointer",
  textAlign: "left",
  "&:not(:last-child)": {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "border",
  },
});

export default function SettingsPage() {
  return (
    <>
      <TopBar back title="설정" />
      <div className={css({ paddingX: "5", paddingTop: "5", paddingBottom: "10" })}>
        <div className={cx(cardSurface, css({ overflow: "hidden" }))}>
          <Link href="/account/update-password" className={row}>
            <KeyRound size={18} className={css({ color: "text.secondary" })} />
            <span className={css({ flex: 1 })}>비밀번호 변경</span>
            <ChevronRight size={18} className={css({ color: "text.tertiary" })} />
          </Link>
          <Link href="/contact" className={row}>
            <Mail size={18} className={css({ color: "text.secondary" })} />
            <span className={css({ flex: 1 })}>문의하기</span>
            <ChevronRight size={18} className={css({ color: "text.tertiary" })} />
          </Link>
          <form action={signOut}>
            <button type="submit" className={cx(row, css({ color: "error" }))}>
              <LogOut size={18} />
              <span className={css({ flex: 1 })}>로그아웃</span>
            </button>
          </form>
        </div>

        <p className={css({ marginTop: "6", textAlign: "center", fontSize: "xs", color: "text.tertiary" })}>
          WIMC · v0.1.0
        </p>
      </div>
    </>
  );
}
