import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { css, cx } from "@/styled-system/css";

/** 온보딩 랜딩 — 미인증 진입점 (파스텔 그라디언트 + WIMC + CTA) */
export default function WelcomePage() {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        maxWidth: "app",
        marginX: "auto",
        paddingX: "6",
        paddingTop: "16",
        paddingBottom: "12",
        backgroundImage:
          "linear-gradient(160deg, token(colors.accent.green), token(colors.accent.lavender))",
      })}
    >
      <div className={css({ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" })}>
        <h1
          className={css({
            fontFamily: "serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "64px",
            lineHeight: "1",
            color: "brown.dark",
          })}
        >
          WIMC
        </h1>
        <p
          className={css({
            marginTop: "5",
            fontSize: "lg",
            lineHeight: "1.5",
            color: "brown.dark",
            maxWidth: "24ch",
          })}
        >
          What&rsquo;s In My Closet — your wardrobe, outfits, and daily style log.
        </p>
      </div>

      <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
        <Link href="/login" className={buttonClass({ fullWidth: true })}>
          로그인하기
        </Link>
        <Link
          href="/signup"
          className={cx(
            buttonClass({ variant: "secondary", fullWidth: true }),
            css({
              bg: "surface",
              borderWidth: "1.5px",
              borderStyle: "solid",
              borderColor: "brown.dark",
            }),
          )}
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
