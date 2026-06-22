import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { TopBar } from "@/components/layout/TopBar";
import { css } from "@/styled-system/css";

export default function UpdatePasswordPage() {
  return (
    <>
      <TopBar title="비밀번호 변경" back />
      <div className={css({ paddingX: "5", paddingTop: "6" })}>
        <UpdatePasswordForm />
      </div>
    </>
  );
}
