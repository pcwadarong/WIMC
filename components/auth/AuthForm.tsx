"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { css } from "@/styled-system/css";

const linkBtn = css({
  fontSize: "sm",
  color: "text.secondary",
  cursor: "pointer",
  _hover: { color: "text.primary" },
});

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { show } = useToast();
  const supabase = createClient();

  const [resetting, setResetting] = useState(false);
  const view = resetting ? "reset" : mode;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      show("이메일을 입력해주세요.", "error");
      return;
    }
    if (view === "signup" && !name.trim()) {
      show("이름을 입력해주세요.", "error");
      return;
    }
    if (view !== "reset" && !password) {
      show("비밀번호를 입력해주세요.", "error");
      return;
    }
    if (view === "signup" && password.length < 6) {
      show("비밀번호는 6자 이상이어야 해요.", "error");
      return;
    }

    setLoading(true);
    const origin = window.location.origin;

    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        show("로그인되었어요.", "success");
        router.push("/");
        router.refresh();
        return;
      }

      if (view === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/confirm`,
            data: { username: name.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          show("가입 완료!", "success");
          router.push("/");
          router.refresh();
        } else {
          show("확인 메일을 보냈어요. 메일 링크로 가입을 완료해주세요.", "success");
          router.push("/login");
        }
        return;
      }

      // reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/confirm?next=/account/update-password`,
      });
      if (error) throw error;
      show("비밀번호 재설정 메일을 보냈어요.", "success");
      setResetting(false);
    } catch (err) {
      show(err instanceof Error ? err.message : "오류가 발생했어요.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {view === "reset" && (
        <p className={css({ marginBottom: "6", fontSize: "sm", color: "text.secondary" })}>
          가입한 이메일로 비밀번호 재설정 링크를 보내드려요.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className={css({ display: "flex", flexDirection: "column", gap: "4" })}
      >
        {view === "signup" && (
          <Input
            id="name"
            name="name"
            label="이름"
            placeholder="표시할 이름"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <Input
          id="email"
          name="email"
          type="email"
          label="이메일"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {view !== "reset" && (
          <Input
            id="password"
            name="password"
            type="password"
            label="비밀번호"
            placeholder={view === "signup" ? "6자 이상" : "비밀번호"}
            autoComplete={view === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <Button type="submit" fullWidth disabled={loading} className={css({ marginTop: "2" })}>
          {loading ? (
            <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
          ) : view === "login" ? (
            "로그인"
          ) : view === "signup" ? (
            "회원가입"
          ) : (
            "재설정 메일 보내기"
          )}
        </Button>
      </form>

      <div
        className={css({
          marginTop: "6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3",
        })}
      >
        {view === "reset" ? (
          <button type="button" onClick={() => setResetting(false)} className={linkBtn}>
            로그인으로 돌아가기
          </button>
        ) : view === "login" ? (
          <>
            <button type="button" onClick={() => setResetting(true)} className={linkBtn}>
              비밀번호 찾기
            </button>
            <span className={css({ color: "border" })}>·</span>
            <Link href="/signup" className={linkBtn}>
              회원가입
            </Link>
          </>
        ) : (
          <Link href="/login" className={linkBtn}>
            이미 계정이 있으신가요?{" "}
            <span className={css({ color: "text.primary", fontWeight: 600 })}>로그인</span>
          </Link>
        )}
      </div>
    </div>
  );
}
