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

export default function SignupPage() {
  return (
    <div className={wrap}>
      <h1 className={css({ textStyle: "displayMd", color: "text.primary" })}>Sign up</h1>
      <p className={css({ marginTop: "2", marginBottom: "8", fontSize: "sm", color: "text.secondary" })}>
        나만의 옷장을 시작해보세요.
      </p>
      <AuthForm mode="signup" />
    </div>
  );
}
