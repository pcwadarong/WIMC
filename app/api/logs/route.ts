import { getMonthLogs, getAllLogs } from "@/lib/data/logs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ym = searchParams.get("ym");
  return Response.json(ym ? await getMonthLogs(ym) : await getAllLogs());
}
