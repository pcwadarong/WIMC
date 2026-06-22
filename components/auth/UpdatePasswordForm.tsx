"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { css } from "@/styled-system/css";

export function UpdatePasswordForm() {
  const router = useRouter();
  const { show } = useToast();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 6) {
      show("비밀번호는 6자 이상이어야 해요.", "error");
      return;
    }
    if (password !== confirm) {
      show("비밀번호가 일치하지 않아요.", "error");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      show(error.message, "error");
      return;
    }
    show("비밀번호가 변경되었어요.", "success");
    router.push("/");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={css({ display: "flex", flexDirection: "column", gap: "4" })}
    >
      <Input
        id="password"
        type="password"
        label="새 비밀번호"
        placeholder="6자 이상"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        id="confirm"
        type="password"
        label="새 비밀번호 확인"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        className={css({ marginTop: "2" })}
      >
        {loading ? (
          <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
        ) : (
          "변경하기"
        )}
      </Button>
    </form>
  );
}
