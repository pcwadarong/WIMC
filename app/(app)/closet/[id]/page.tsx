import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getItem } from "@/lib/data/items";
import { getCategoryTree } from "@/lib/data/categories";
import { ItemDetail } from "@/components/items/ItemDetail";
import { FavoriteToggle } from "@/components/items/FavoriteToggle";
import { DeleteItemButton } from "@/components/items/DeleteItemButton";
import { TopBar } from "@/components/layout/TopBar";
import { css } from "@/styled-system/css";

function resolveCategoryLabel(
  categories: Awaited<ReturnType<typeof getCategoryTree>>,
  categoryId: string | null,
): string | null {
  if (!categoryId) return null;
  for (const parent of categories) {
    const child = parent.children.find((c) => c.id === categoryId);
    if (child) return `${parent.name} > ${child.name}`;
    if (parent.id === categoryId) return parent.name;
  }
  return null;
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const categories = await getCategoryTree();
  const categoryLabel = resolveCategoryLabel(categories, item.category_id);

  return (
    <>
      <TopBar
        back
        action={<FavoriteToggle id={item.id} initial={item.is_favorite} />}
      />
      <ItemDetail item={item} categoryLabel={categoryLabel} />
      <div
        className={css({
          paddingX: "5",
          paddingBottom: "10",
          display: "flex",
          flexDirection: "column",
          gap: "3",
        })}
      >
        <Link
          href={`/closet/${item.id}/edit`}
          className={css({
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2",
            height: "52px",
            borderRadius: "full",
            bg: "surface.muted",
            color: "text.primary",
            fontSize: "base",
            fontWeight: 600,
            _hover: { bg: "border" },
          })}
        >
          <Pencil size={18} />
          수정
        </Link>
        <DeleteItemButton id={item.id} />
      </div>
    </>
  );
}
