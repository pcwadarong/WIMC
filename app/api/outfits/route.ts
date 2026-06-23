import { getOutfits } from "@/lib/data/outfits";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getOutfits());
}
