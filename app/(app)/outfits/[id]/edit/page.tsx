import { OutfitBuilderScreen } from "@/components/outfits/OutfitBuilderScreen";
import { TopBar } from "@/components/layout/TopBar";

export default async function EditOutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <TopBar back title="Edit Outfit" />
      <OutfitBuilderScreen outfitId={id} />
    </>
  );
}
