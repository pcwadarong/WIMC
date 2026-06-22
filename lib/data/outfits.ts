import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Outfit } from "@/types";

export async function getOutfits(): Promise<Outfit[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as Outfit[]) ?? [];
}

export async function getOutfit(id: string): Promise<Outfit | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", id)
    .single();

  return (data as Outfit) ?? null;
}
