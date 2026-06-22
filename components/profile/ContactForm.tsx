"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { css } from "@/styled-system/css";

const CONTACT_EMAIL = "pcwadarong@naver.com";

export function ContactForm() {
  const { show } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim()) {
      show("문의 내용을 입력해주세요.", "error");
      return;
    }
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `[WIMC 문의] ${subject.trim() || "문의"}`,
    )}&body=${encodeURIComponent(message.trim())}`;
    window.location.href = url;
  };

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
      <p className={css({ fontSize: "sm", color: "text.secondary" })}>
        의견이나 버그 제보를 보내주세요. 메일 앱으로 연결돼요.
      </p>

      <Input
        id="subject"
        label="제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="예: 코디 저장 오류"
      />

      <div>
        <span className={css({ display: "block", marginBottom: "2", fontSize: "sm", fontWeight: 500, color: "text.secondary" })}>
          내용
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="문의 내용을 적어주세요."
          className={css({
            width: "100%",
            padding: "4",
            bg: "surface.muted",
            borderRadius: "sm",
            fontSize: "base",
            color: "text.primary",
            resize: "vertical",
            _placeholder: { color: "text.tertiary" },
            _focusVisible: { outline: "none" },
          })}
        />
      </div>

      <Button type="button" fullWidth onClick={send}>
        <Mail size={18} />
        메일로 문의 보내기
      </Button>

      <p className={css({ fontSize: "xs", color: "text.tertiary", textAlign: "center" })}>
        또는 직접 {CONTACT_EMAIL} 로 보내주세요.
      </p>
    </div>
  );
}
