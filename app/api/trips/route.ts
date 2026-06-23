import { getTrips } from "@/lib/data/trips";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getTrips());
}
