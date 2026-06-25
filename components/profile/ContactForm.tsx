"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { submitInquiry } from "@/app/(app)/contact/actions";
import { css } from "@/styled-system/css";

const CONTACT_EMAIL = "pcwadarong@naver.com";

export function ContactForm() {
  const { show } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) {
      show("문의 내용을 입력해주세요.", "error");
      return;
    }
    setSending(true);
    const result = await submitInquiry({ subject, message });
    setSending(false);
    if ("error" in result) {
      show(result.error, "error");
      return;
    }
    show("문의를 보냈어요. 확인 후 답변드릴게요.", "success");
    setSubject("");
    setMessage("");
  };

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
      <p className={css({ fontSize: "sm", color: "text.secondary" })}>
        의견이나 버그 제보를 보내주세요. 보내주신 내용은 운영자가 확인해요.
      </p>

      <Input
        id="subject"
        label="제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="예: 코디 저장 오류"
      />

      <Textarea
        id="message"
        label="내용"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        placeholder="문의 내용을 적어주세요."
      />

      <Button type="button" fullWidth onClick={send} disabled={sending}>
        {sending ? (
          <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
        ) : (
          <>
            <Send size={18} />
            문의 보내기
          </>
        )}
      </Button>

      <p className={css({ fontSize: "xs", color: "text.tertiary", textAlign: "center" })}>
        급한 문의는 {CONTACT_EMAIL} 로 직접 보내주세요.
      </p>
    </div>
  );
}
