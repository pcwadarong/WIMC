"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface LogInput {
  date: string; // YYYY-MM-DD
  outfit_id: string | null;
  photo_url: string | null;
  memo: string | null;
}

export type ActionResult = { ok: true } | { error: string };

export async function upsertLog(input: LogInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  if (!input.outfit_id && !input.photo_url)
    return { error: "코디를 선택하거나 사진을 올려주세요." };

  const { error } = await supabase.from("daily_logs").upsert(
    {
      user_id: user.id,
      date: input.date,
      outfit_id: input.outfit_id,
      photo_url: input.photo_url,
      memo: input.memo?.trim() || null,
    },
    { onConflict: "user_id,date" },
  );

  if (error) return { error: error.message };

  revalidatePath("/calendar");
  return { ok: true };
}

export async function deleteLog(date: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("daily_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("date", date);

  if (error) return { error: error.message };

  revalidatePath("/calendar");
  return { ok: true };
}
