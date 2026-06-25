"use client";

import { useMemo, useState } from "react";
import { DayLogForm } from "@/components/calendar/DayLogForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOutfits, useItems, useLog } from "@/lib/queries/hooks";
import { buildOutfitThumbs, indexById } from "@/lib/utils/item";
import { css } from "@/styled-system/css";

const pad = (n: number) => String(n).padStart(2, "0");

/** 착용 기록 추가/수정 공용 — 코디 썸네일 + 기존 기록을 받아 DayLogForm 렌더 */
export function DayLogScreen({
  date,
  pickDate = false,
}: {
  date?: string;
  pickDate?: boolean;
}) {
  // 기록 추가는 오늘 날짜를 클라이언트에서 계산(정적 프리렌더의 빌드시점 고정 회피).
  const [clientToday] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
  });
  const effectiveDate = date ?? clientToday;

  const { data: outfits = [], isLoading: outfitsLoading } = useOutfits();
  const { data: items = [], isLoading: itemsLoading } = useItems();
  // 기록 추가(pickDate)면 기존 기록을 불러오지 않는다(초기값 null).
  const { data: log, isLoading: logLoading } = useLog(pickDate ? "" : effectiveDate);

  const outfitThumbs = useMemo(
    () => buildOutfitThumbs(outfits, indexById(items)),
    [outfits, items],
  );

  if (outfitsLoading || itemsLoading || (!pickDate && logLoading)) {
    return (
      <div className={css({ paddingX: "5", paddingTop: "4", display: "flex", flexDirection: "column", gap: "4" })}>
        <Skeleton className={css({ height: "120px" })} />
        <Skeleton className={css({ height: "44px" })} />
      </div>
    );
  }

  return (
    <DayLogForm
      date={effectiveDate}
      initialOutfitId={log?.outfit_id ?? null}
      initialItemIds={log?.item_ids ?? []}
      initialPhotos={log?.photos ?? []}
      initialMemo={log?.memo ?? null}
      outfits={outfitThumbs}
      items={items}
      pickDate={pickDate}
    />
  );
}
