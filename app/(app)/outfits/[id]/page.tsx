import { OutfitDetailScreen } from "@/components/outfits/OutfitDetailScreen";

export default async function OutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OutfitDetailScreen id={id} />;
}
