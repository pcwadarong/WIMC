import { AuthForm } from "@/components/auth/AuthForm";
import { css } from "@/styled-system/css";

const wrap = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: "100dvh",
  maxWidth: "app",
  marginX: "auto",
  paddingX: "5",
  paddingY: "12",
  bg: "bg",
});

export default function LoginPage() {
  return (
    <div className={wrap}>
      <h1
        className={css({
          textStyle: "3xl",
          fontWeight: 800,
          color: "brown.dark",
        })}
      >
        WIMC
      </h1>
      <p
        className={css({
          marginTop: "2",
          marginBottom: "10",
          textStyle: "base",
          color: "text.secondary",
        })}
      >
        나만의 옷장 · 코디 기록 · AI 스타일 추천
      </p>

      <AuthForm />
    </div>
  );
}
