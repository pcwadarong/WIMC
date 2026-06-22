import { getItems } from "@/lib/data/items";
import { getCategoryTree } from "@/lib/data/categories";
import { OutfitBuilder } from "@/components/outfits/OutfitBuilder";
import { TopBar } from "@/components/layout/TopBar";
import { buildCategoryMap } from "@/lib/utils/category";
import { PageContainer } from "@/components/layout/PageContainer";
import { css } from "@/styled-system/css";

export default async function NewOutfitPage() {
  const [items, categories] = await Promise.all([getItems(), getCategoryTree()]);

  const categoryMap = buildCategoryMap(categories);
  const parents = categories.map((c) => c.name);

  return (
    <>
      <TopBar title="코디 만들기" back />
      {items.length === 0 ? (
        <PageContainer>
          <p className={css({ fontSize: "sm", color: "text.tertiary", textAlign: "center", marginTop: "10" })}>
            먼저 옷장에 아이템을 등록해주세요.
          </p>
        </PageContainer>
      ) : (
        <OutfitBuilder items={items} categoryMap={categoryMap} parents={parents} />
      )}
    </>
  );
}
