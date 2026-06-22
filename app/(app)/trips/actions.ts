"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true; id?: string } | { error: string };

export interface TripInput {
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  memo: string | null;
}

export async function createTrip(input: TripInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!input.name.trim()) return { error: "여행 이름을 입력해주세요." };

  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      destination: input.destination?.trim() || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      memo: input.memo?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/trips");
  return { ok: true, id: data?.id as string };
}

export async function deleteTrip(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/trips");
  return { ok: true };
}

/** 여행 일차별 코디 지정 (trip_days 수동 upsert) */
export async function setTripDay(
  tripId: string,
  date: string,
  outfitId: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // 소유권 확인
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single();
  if (!trip) return { error: "여행을 찾을 수 없습니다." };

  const { data: existing } = await supabase
    .from("trip_days")
    .select("id")
    .eq("trip_id", tripId)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("trip_days")
      .update({ outfit_id: outfitId })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("trip_days")
      .insert({ trip_id: tripId, date, outfit_id: outfitId });
    if (error) return { error: error.message };
  }

  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}
