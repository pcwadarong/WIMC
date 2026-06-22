"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProfilePhotos, UserLocation } from "@/types";

export interface ProfileInput {
  username: string | null;
  style_keywords: string[];
  /** AI로 받은 상세 스타일 분석 (notes 컬럼에 저장) */
  notes: string | null;
  location: UserLocation | null;
  profile_photos: ProfilePhotos | null;
}

export type ProfileResult = { ok: true } | { error: string };

export async function updateProfile(
  input: ProfileInput,
): Promise<ProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...input }, { onConflict: "id" });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true };
}
