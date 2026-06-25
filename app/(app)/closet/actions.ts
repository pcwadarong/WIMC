"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ColorValue, ItemImage, ItemStatus, Season, SizeInfo } from "@/types";

export interface ItemInput {
  name: string;
  category_id: string | null;
  brand: string | null;
  purchase_from: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  memo: string | null;
  material: string | null;
  season: Season | null;
  colors: ColorValue[];
  size_info: SizeInfo | null;
  images: ItemImage[];
  is_favorite: boolean;
  status: ItemStatus;
  keywords: string[];
}

export type ActionResult = { ok: true; id?: string } | { error: string };

export async function createItem(input: ItemInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  if (!input.name.trim()) return { error: "이름을 입력해주세요." };

  const { data, error } = await supabase
    .from("items")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      category_id: input.category_id,
      brand: input.brand,
      purchase_from: input.purchase_from,
      purchase_price: input.purchase_price,
      purchase_date: input.purchase_date,
      memo: input.memo,
      material: input.material,
      season: input.season,
      colors: input.colors,
      size_info: input.size_info,
      images: input.images,
      is_favorite: input.is_favorite,
      status: input.status,
      keywords: input.keywords,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/closet");
  revalidatePath("/");
  return { ok: true, id: data?.id as string };
}

export async function updateItem(
  id: string,
  input: ItemInput,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!input.name.trim()) return { error: "이름을 입력해주세요." };

  const { error } = await supabase
    .from("items")
    .update({
      name: input.name.trim(),
      category_id: input.category_id,
      brand: input.brand,
      purchase_from: input.purchase_from,
      purchase_price: input.purchase_price,
      purchase_date: input.purchase_date,
      memo: input.memo,
      material: input.material,
      season: input.season,
      colors: input.colors,
      size_info: input.size_info,
      images: input.images,
      status: input.status,
      keywords: input.keywords,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/closet");
  revalidatePath(`/closet/${id}`);
  revalidatePath("/");
  return { ok: true, id };
}

export async function toggleFavorite(
  id: string,
  next: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("items")
    .update({ is_favorite: next })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/closet");
  revalidatePath(`/closet/${id}`);
  return { ok: true };
}

export async function deleteItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/closet");
  revalidatePath("/");
  return { ok: true };
}

/** 다중 삭제 */
export async function bulkDeleteItems(ids: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (ids.length === 0) return { ok: true };

  const { error } = await supabase
    .from("items")
    .delete()
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/closet");
  revalidatePath("/");
  return { ok: true };
}

/** 다중 즐겨찾기 설정/해제 */
export async function bulkSetFavorite(
  ids: string[],
  value: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (ids.length === 0) return { ok: true };

  const { error } = await supabase
    .from("items")
    .update({ is_favorite: value })
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/closet");
  return { ok: true };
}
