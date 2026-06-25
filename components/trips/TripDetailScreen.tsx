"use client";

import { useMemo, useState } from "react";
import { Pencil, Check } from "lucide-react";
import { TripDayPlanner } from "@/components/trips/TripDayPlanner";
import { DeleteTripButton } from "@/components/trips/DeleteTripButton";
import { TopBar } from "@/components/layout/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { iconAction } from "@/components/ui/styles";
import { useTrip, useOutfits, useItems } from "@/lib/queries/hooks";
import { buildOutfitThumbs, indexById } from "@/lib/utils/item";
import { css } from "@/styled-system/css";

const pad = (n: number) => String(n).padStart(2, "0");

function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  let guard = 0;
  for (const d = s; d <= e && guard < 90; d.setDate(d.getDate() + 1), guard++) {
    out.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }
  return out;
}

export function TripDetailScreen({ id }: { id: string }) {
  const { data: result, isLoading } = useTrip(id);
  const { data: outfits = [] } = useOutfits();
  const { data: items = [] } = useItems();
  const [editing, setEditing] = useState(false);

  const outfitThumbs = useMemo(
    () => buildOutfitThumbs(outfits, indexById(items)),
    [outfits, items],
  );

  if (isLoading) {
    return (
      <>
        <TopBar back title="Trip" />
        <div className={css({ paddingX: "5", paddingTop: "4" })}>
          <Skeleton className={css({ height: "24px", width: "50%", marginBottom: "6" })} />
          <Skeleton className={css({ height: "200px" })} />
        </div>
      </>
    );
  }

  if (!result) {
    return (
      <>
        <TopBar back />
        <p className={css({ marginTop: "16", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
          삭제되었거나 없는 여행이에요.
        </p>
      </>
    );
  }

  const { trip, days } = result;
  const dates =
    trip.start_date && trip.end_date ? dateRange(trip.start_date, trip.end_date) : [];
  const initial: Record<string, string | null> = {};
  for (const dd of days) initial[dd.date] = dd.outfit_id;

  return (
    <>
      <TopBar
        back
        title={trip.name}
        action={
          dates.length > 0 && outfitThumbs.length > 0 ? (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-label={editing ? "완료" : "편집"}
              className={iconAction}
            >
              {editing ? <Check size={20} /> : <Pencil size={19} />}
            </button>
          ) : undefined
        }
      />
      <div className={css({ paddingX: "5", paddingBottom: "10" })}>
        <h1 className={css({ textStyle: "displayMd", color: "text.primary", marginTop: "4" })}>
          {trip.name}
        </h1>
        <p className={css({ marginTop: "1", fontSize: "sm", color: "text.secondary" })}>
          {[trip.destination, trip.start_date && `${trip.start_date}${trip.end_date ? ` ~ ${trip.end_date}` : ""}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {trip.memo && (
          <p className={css({ marginTop: "3", fontSize: "sm", color: "text.secondary", whiteSpace: "pre-wrap" })}>
            {trip.memo}
          </p>
        )}

        <h2 className={css({ textStyle: "displaySm", color: "text.primary", marginTop: "8", marginBottom: "1" })}>
          Daily Outfits
        </h2>
        <p className={css({ marginBottom: "4", fontSize: "xs", color: "text.tertiary" })}>
          코디를 배치하면 그 날짜 캘린더에도 자동으로 기록돼요.
        </p>
        {dates.length === 0 ? (
          <p className={css({ fontSize: "sm", color: "text.tertiary" })}>
            시작일·종료일을 설정하면 일차별로 코디를 계획할 수 있어요.
          </p>
        ) : outfitThumbs.length === 0 ? (
          <p className={css({ fontSize: "sm", color: "text.tertiary" })}>
            코디를 먼저 만들면 여기서 일차별로 배치할 수 있어요.
          </p>
        ) : (
          <TripDayPlanner
            tripId={trip.id}
            dates={dates}
            initial={initial}
            outfits={outfitThumbs}
            readOnly={!editing}
          />
        )}

        <div className={css({ marginTop: "8" })}>
          <DeleteTripButton id={trip.id} />
        </div>
      </div>
    </>
  );
}
