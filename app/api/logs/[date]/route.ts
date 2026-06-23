import { getLog } from "@/lib/data/logs";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  return Response.json(await getLog(date));
}
