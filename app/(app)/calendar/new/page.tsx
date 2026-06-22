import { getOutfits } from "@/lib/data/outfits";
import { getItems } from "@/lib/data/items";
import { buildOutfitThumbs, indexById } from "@/lib/utils/item";
import { DayLogForm } from "@/components/calendar/DayLogForm";
import { TopBar } from "@/components/layout/TopBar";

const pad = (n: number) => String(n).padStart(2, "0");

export default async function NewLogPage() {
  const [outfits, items] = await Promise.all([getOutfits(), getItems()]);

  const outfitThumbs = buildOutfitThumbs(outfits, indexById(items));

  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  return (
    <>
      <TopBar back title="기록 추가" />
      <DayLogForm
        date={today}
        initialOutfitId={null}
        initialPhotoUrl={null}
        initialMemo={null}
        outfits={outfitThumbs}
        pickDate
      />
    </>
  );
}
