import { getMonthItemSummary } from "@/lib/data/items";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ym = searchParams.get("ym") ?? "";
  return Response.json(await getMonthItemSummary(ym));
}
