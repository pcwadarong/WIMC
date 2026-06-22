import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { css } from "@/styled-system/css";

export default function WelcomePage() {
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
        paddingX: "5",
        bg: "bg",
      })}
    >
      <span className={css({ color: "success", marginBottom: "5" })}>
        <CheckCircle2 size={56} strokeWidth={1.6} />
      </span>
      <h1
        className={css({
          textStyle: "2xl",
          fontWeight: 800,
          color: "brown.dark",
        })}
      >
        WIMC에 오신 걸 환영해요
      </h1>
      <p
        className={css({
          marginTop: "3",
          textStyle: "base",
          color: "text.secondary",
        })}
      >
        이메일 인증이 완료됐어요.
        <br />
        이제 나만의 옷장을 채워볼까요?
      </p>

      <div className={css({ marginTop: "10", width: "100%" })}>
        <Link href="/">
          <Button fullWidth>시작하기</Button>
        </Link>
        <Link
          href="/login"
          className={css({
            display: "block",
            marginTop: "3",
            fontSize: "sm",
            color: "text.secondary",
          })}
        >
          로그인 화면으로
        </Link>
      </div>
    </div>
  );
}
