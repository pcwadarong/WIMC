"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { css, cx } from "@/styled-system/css";

type Mode = "login" | "signup" | "reset";

export function AuthForm() {
  const router = useRouter();
  const { show } = useToast();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
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
    if (mode !== "reset" && !password) {
      show("비밀번호를 입력해주세요.", "error");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      show("비밀번호는 6자 이상이어야 해요.", "error");
      return;
    }

    setLoading(true);
    const origin = window.location.origin;

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        show("로그인되었어요.", "success");
        router.push("/");
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/confirm` },
        });
        if (error) throw error;
        if (data.session) {
          show("가입 완료!", "success");
          router.push("/");
          router.refresh();
        } else {
          show("확인 메일을 보냈어요. 메일 링크로 가입을 완료해주세요.", "success");
          setMode("login");
        }
        return;
      }

      // reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/confirm?next=/account/update-password`,
      });
      if (error) throw error;
      show("비밀번호 재설정 메일을 보냈어요.", "success");
      setMode("login");
    } catch (err) {
      show(err instanceof Error ? err.message : "오류가 발생했어요.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {mode !== "reset" && (
        <div
          className={css({
            display: "flex",
            gap: "1",
            padding: "1",
            bg: "surface.muted",
            borderRadius: "full",
            marginBottom: "6",
          })}
        >
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cx(
                css({
                  flex: 1,
                  height: "40px",
                  borderRadius: "full",
                  fontSize: "sm",
                  fontWeight: 600,
                  color: "text.secondary",
                  cursor: "pointer",
                  transition: "background 0.15s ease, color 0.15s ease",
                }),
                mode === m &&
                  css({ bg: "surface", color: "text.primary", boxShadow: "card" }),
              )}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>
      )}

      {mode === "reset" && (
        <p
          className={css({
            marginBottom: "6",
            fontSize: "sm",
            color: "text.secondary",
          })}
        >
          가입한 이메일로 비밀번호 재설정 링크를 보내드려요.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className={css({ display: "flex", flexDirection: "column", gap: "4" })}
      >
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
        {mode !== "reset" && (
          <Input
            id="password"
            name="password"
            type="password"
            label="비밀번호"
            placeholder={mode === "signup" ? "6자 이상" : "비밀번호"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <Button type="submit" fullWidth disabled={loading} className={css({ marginTop: "2" })}>
          {loading ? (
            <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
          ) : mode === "login" ? (
            "로그인"
          ) : mode === "signup" ? (
            "회원가입"
          ) : (
            "재설정 메일 보내기"
          )}
        </Button>
      </form>

      <div
        className={css({
          marginTop: "5",
          textAlign: "center",
        })}
      >
        {mode === "reset" ? (
          <button
            type="button"
            onClick={() => setMode("login")}
            className={css({
              fontSize: "sm",
              color: "text.secondary",
              cursor: "pointer",
            })}
          >
            로그인으로 돌아가기
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("reset")}
            className={css({
              fontSize: "sm",
              color: "text.secondary",
              cursor: "pointer",
            })}
          >
            비밀번호를 잊으셨나요?
          </button>
        )}
      </div>
    </div>
  );
}
