import { getItems } from "@/lib/data/items";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const items = await getItems({
    categoryIds: category ? category.split(",") : undefined,
    favorite: searchParams.get("favorite") === "1" || undefined,
    status: searchParams.get("status") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });
  return Response.json(items);
}
