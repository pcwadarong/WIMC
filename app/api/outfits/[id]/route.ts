import { getOutfit } from "@/lib/data/outfits";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return Response.json(await getOutfit(id));
}
