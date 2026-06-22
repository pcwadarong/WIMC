import { notFound } from "next/navigation";
import { getItem } from "@/lib/data/items";
import { getCategoryTree } from "@/lib/data/categories";
import { ItemForm } from "@/components/items/ItemForm";
import { TopBar } from "@/components/layout/TopBar";
import { css } from "@/styled-system/css";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, categories] = await Promise.all([
    getItem(id),
    getCategoryTree(),
  ]);
  if (!item) notFound();

  return (
    <>
      <TopBar title="아이템 수정" back />
      <div className={css({ paddingX: "5", paddingBottom: "10" })}>
        <ItemForm categories={categories} item={item} />
      </div>
    </>
  );
}
