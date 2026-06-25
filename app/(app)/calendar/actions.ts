"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface LogInput {
  date: string; // YYYY-MM-DD
  outfit_id: string | null;
  item_ids: string[];
  photos: string[];
  memo: string | null;
}

export type ActionResult = { ok: true } | { error: string };

export async function upsertLog(input: LogInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  if (!input.outfit_id && input.photos.length === 0 && input.item_ids.length === 0)
    return { error: "사진·즉석 조합·저장된 코디 중 하나는 채워주세요." };

  const { error } = await supabase.from("daily_logs").upsert(
    {
      user_id: user.id,
      date: input.date,
      outfit_id: input.outfit_id,
      item_ids: input.item_ids,
      photos: input.photos,
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
