import { getCategoryTree } from "@/lib/data/categories";
import { ItemForm } from "@/components/items/ItemForm";
import { TopBar } from "@/components/layout/TopBar";
import { css } from "@/styled-system/css";

export default async function NewItemPage() {
  const categories = await getCategoryTree();

  return (
    <>
      <TopBar title="아이템 등록" back />
      <div className={css({ paddingX: "5", paddingBottom: "10" })}>
        <ItemForm categories={categories} />
      </div>
    </>
  );
}
