import { getCategoryTree } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getCategoryTree());
}
