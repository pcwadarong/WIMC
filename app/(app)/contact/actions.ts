"use server";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { error: string };

export async function submitInquiry(input: {
  subject: string;
  message: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!input.message.trim()) return { error: "문의 내용을 입력해주세요." };

  const { error } = await supabase.from("inquiries").insert({
    user_id: user.id,
    email: user.email,
    subject: input.subject.trim() || null,
    message: input.message.trim(),
  });

  if (error) return { error: error.message };
  return { ok: true };
}
