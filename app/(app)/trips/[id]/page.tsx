import { TripDetailScreen } from "@/components/trips/TripDetailScreen";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripDetailScreen id={id} />;
}
