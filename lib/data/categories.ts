import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CATEGORIES } from "@/lib/constants/categories";
import type { Category, CategoryNode } from "@/types";

/** 유저의 카테고리 트리 반환. 없으면 기본 카테고리를 시드한다. */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let cats = await fetchCategories(user.id);
  if (cats.length === 0) {
    await seedCategories(user.id);
    cats = await fetchCategories(user.id);
  }

  // 동시 시드 레이스로 중복이 생겨도 UI엔 안 보이도록 이름 기준 dedupe
  const parents: Category[] = [];
  const seenParent = new Set<string>();
  for (const c of cats) {
    if (!c.parent_id && !seenParent.has(c.name)) {
      seenParent.add(c.name);
      parents.push(c);
    }
  }

  return parents.map((p) => {
    const seenChild = new Set<string>();
    const children = cats.filter((c) => {
      if (c.parent_id !== p.id || seenChild.has(c.name)) return false;
      seenChild.add(c.name);
      return true;
    });
    return { ...p, children };
  });
}

async function fetchCategories(userId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  return (data as Category[]) ?? [];
}

async function seedCategories(userId: string) {
  const supabase = await createClient();
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const dc = DEFAULT_CATEGORIES[i];
    const { data: parent } = await supabase
      .from("categories")
      .insert({ user_id: userId, name: dc.name, sort_order: i })
      .select("id")
      .single();
    if (!parent) continue;

    const children = dc.children.map((name, j) => ({
      user_id: userId,
      name,
      parent_id: parent.id as string,
      sort_order: j,
    }));
    await supabase.from("categories").insert(children);
  }
}
