import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ItemCard } from "@/components/items/ItemCard";
import { TodayPanel } from "@/components/home/TodayPanel";
import { getItems } from "@/lib/data/items";
import { getCategoryTree } from "@/lib/data/categories";
import { getProfile } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";
import { buildProfileNote } from "@/lib/profile-note";
import { buildCategoryMap } from "@/lib/utils/category";
import { css } from "@/styled-system/css";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name = user?.user_metadata?.username ?? user?.email?.split("@")[0];

  const [items, categories, profile] = await Promise.all([
    getItems(),
    getCategoryTree(),
    getProfile(),
  ]);
  const profileNote = buildProfileNote(profile);
  const categoryMap = buildCategoryMap(categories);
  const recent = items.slice(0, 3);

  return (
    <PageContainer>
      <div>
        <p className={css({ textStyle: "sm", color: "text.secondary" })}>
          안녕하세요{name ? `, ${name}님` : ""}
        </p>
        <h1
          className={css({
            textStyle: "3xl",
            fontWeight: 700,
            color: "text.primary",
            marginTop: "3",
          })}
        >
          오늘 뭐 입지?
        </h1>
      </div>

      <TodayPanel
        items={items}
        categoryMap={categoryMap}
        profileNote={profileNote}
        location={profile?.location ?? null}
      />

      {recent.length > 0 && (
        <section className={css({ marginTop: "10" })}>
          <div
            className={css({
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "4",
            })}
          >
            <h2
              className={css({
                textStyle: "lg",
                fontWeight: 700,
                color: "text.primary",
              })}
            >
              최근 등록
            </h2>
            <Link
              href="/closet"
              className={css({ fontSize: "sm", color: "text.secondary" })}
            >
              전체 보기
            </Link>
          </div>
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "3",
            })}
          >
            {recent.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
