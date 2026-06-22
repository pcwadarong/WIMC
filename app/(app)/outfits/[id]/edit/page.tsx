import { notFound } from "next/navigation";
import { getOutfit } from "@/lib/data/outfits";
import { getItems } from "@/lib/data/items";
import { getCategoryTree } from "@/lib/data/categories";
import { OutfitBuilder } from "@/components/outfits/OutfitBuilder";
import { TopBar } from "@/components/layout/TopBar";
import { buildCategoryMap } from "@/lib/utils/category";

export default async function EditOutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [outfit, items, categories] = await Promise.all([
    getOutfit(id),
    getItems(),
    getCategoryTree(),
  ]);
  if (!outfit) notFound();

  const categoryMap = buildCategoryMap(categories);
  const parents = categories.map((c) => c.name);

  return (
    <>
      <TopBar back title="코디 수정" />
      <OutfitBuilder
        items={items}
        categoryMap={categoryMap}
        parents={parents}
        outfitId={outfit.id}
        initialName={outfit.name ?? ""}
        initialSelected={outfit.item_ids ?? []}
      />
    </>
  );
}
