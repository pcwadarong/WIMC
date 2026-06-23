import { ItemDetailScreen } from "@/components/items/ItemDetailScreen";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemDetailScreen id={id} />;
}
