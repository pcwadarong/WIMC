import { notFound } from "next/navigation";
import { getLog } from "@/lib/data/logs";
import { getOutfits } from "@/lib/data/outfits";
import { getItems } from "@/lib/data/items";
import { buildOutfitThumbs, indexById } from "@/lib/utils/item";
import { DayLogForm } from "@/components/calendar/DayLogForm";
import { TopBar } from "@/components/layout/TopBar";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const [log, outfits, items] = await Promise.all([
    getLog(date),
    getOutfits(),
    getItems(),
  ]);

  const outfitThumbs = buildOutfitThumbs(outfits, indexById(items));

  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  const title = `${m}월 ${d}일 (${weekday})`;

  return (
    <>
      <TopBar back title={title} />
      <DayLogForm
        date={date}
        initialOutfitId={log?.outfit_id ?? null}
        initialPhotoUrl={log?.photo_url ?? null}
        initialMemo={log?.memo ?? null}
        outfits={outfitThumbs}
      />
    </>
  );
}
