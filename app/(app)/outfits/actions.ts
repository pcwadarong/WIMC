"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface OutfitInput {
  name: string | null;
  item_ids: string[];
  tags: string[];
  memo: string | null;
}

export type ActionResult = { ok: true; id?: string } | { error: string };

export async function createOutfit(input: OutfitInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  if (input.item_ids.length === 0)
    return { error: "아이템을 1개 이상 선택해주세요." };

  const { data, error } = await supabase
    .from("outfits")
    .insert({
      user_id: user.id,
      name: input.name?.trim() || null,
      item_ids: input.item_ids,
      tags: input.tags,
      memo: input.memo?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/outfits");
  return { ok: true, id: data?.id as string };
}

export async function updateOutfit(
  id: string,
  input: OutfitInput,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (input.item_ids.length === 0)
    return { error: "아이템을 1개 이상 선택해주세요." };

  const { error } = await supabase
    .from("outfits")
    .update({
      name: input.name?.trim() || null,
      item_ids: input.item_ids,
      tags: input.tags,
      memo: input.memo?.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/outfits");
  revalidatePath(`/outfits/${id}`);
  return { ok: true, id };
}

export async function deleteOutfit(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("outfits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/outfits");
  return { ok: true };
}

export async function toggleOutfitFavorite(
  id: string,
  next: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("outfits")
    .update({ is_favorite: next })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/outfits");
  return { ok: true };
}

/** 다중 삭제 */
export async function bulkDeleteOutfits(ids: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (ids.length === 0) return { ok: true };

  const { error } = await supabase
    .from("outfits")
    .delete()
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/outfits");
  return { ok: true };
}
