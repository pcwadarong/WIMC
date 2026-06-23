import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { css } from "@/styled-system/css";

export default function NotFound() {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        minHeight: "100dvh",
        maxWidth: "app",
        marginX: "auto",
        paddingX: "6",
        bg: "bg",
      })}
    >
      <p
        className={css({
          fontFamily: "serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "64px",
          lineHeight: "1",
          color: "brown.dark",
        })}
      >
        404
      </p>
      <h1 className={css({ marginTop: "4", textStyle: "lg", fontWeight: 700, color: "text.primary" })}>
        페이지를 찾을 수 없어요
      </h1>
      <p className={css({ marginTop: "2", fontSize: "sm", color: "text.secondary" })}>
        주소가 바뀌었거나 삭제된 페이지일 수 있어요.
      </p>

      <div className={css({ marginTop: "10", width: "100%" })}>
        <Link href="/" className={css({ display: "block", width: "100%" })}>
          <Button fullWidth>홈으로</Button>
        </Link>
      </div>
    </div>
  );
}
