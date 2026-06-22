import { getCategoryTree } from "@/lib/data/categories";
import { getItems } from "@/lib/data/items";
import { getProfile } from "@/lib/data/profile";
import { ClosetView } from "@/components/items/ClosetView";
import { PageContainer } from "@/components/layout/PageContainer";
import { Fab } from "@/components/ui/Fab";
import { buildProfileNote } from "@/lib/profile-note";
import { buildCategoryMap } from "@/lib/utils/category";
import { css } from "@/styled-system/css";

export default async function ClosetPage() {
  const [items, categories, profile] = await Promise.all([
    getItems(),
    getCategoryTree(),
    getProfile(),
  ]);

  const categoryMap = buildCategoryMap(categories);
  const parents = categories.map((c) => c.name);
  const profileNote = buildProfileNote(profile);

  return (
    <PageContainer>
      {items.length === 0 ? (
        <>
          <h1 className={css({ textStyle: "2xl", fontWeight: 700, color: "text.primary" })}>
            옷장
          </h1>
          <p className={css({ marginTop: "12", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
            아직 등록한 아이템이 없어요. + 버튼으로 추가해보세요.
          </p>
        </>
      ) : (
        <ClosetView
          items={items}
          categoryMap={categoryMap}
          parents={parents}
          profileNote={profileNote}
        />
      )}

      <Fab href="/closet/new" label="아이템 추가" />
    </PageContainer>
  );
}
