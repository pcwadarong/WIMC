import { getProfile } from "@/lib/data/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getProfile());
}
