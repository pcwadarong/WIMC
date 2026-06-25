"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { setTripDay } from "@/app/(app)/trips/actions";
import type { OutfitThumb } from "@/components/calendar/DayLogForm";
import { css } from "@/styled-system/css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function TripDayPlanner({
  tripId,
  dates,
  initial,
  outfits,
  readOnly = false,
}: {
  tripId: string;
  dates: string[];
  initial: Record<string, string | null>;
  outfits: OutfitThumb[];
  readOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const { show } = useToast();
  const [assign, setAssign] = useState<Record<string, string | null>>(initial);

  const change = async (date: string, outfitId: string | null) => {
    setAssign((prev) => ({ ...prev, [date]: outfitId }));
    const result = await setTripDay(tripId, date, outfitId);
    if ("error" in result) {
      show(result.error, "error");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["trips", "detail", tripId] });
  };

  const label = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    const w = WEEKDAYS[new Date(y, m - 1, day).getDay()];
    return `${m}.${day} (${w})`;
  };

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
      {dates.map((d, i) => {
        const oid = assign[d] ?? "";
        const chosen = outfits.find((o) => o.id === oid);
        const thumb = chosen?.thumb ?? null;
        return (
          <div
            key={d}
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "3",
              bg: "surface",
              borderRadius: "md",
              boxShadow: "card",
              padding: "3",
            })}
          >
            <div
              className={css({
                position: "relative",
                width: "52px",
                height: "52px",
                borderRadius: "sm",
                overflow: "hidden",
                bg: "surface.muted",
                flexShrink: 0,
              })}
            >
              {thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" className={css({ width: "100%", height: "100%", objectFit: "cover" })} />
              )}
            </div>
            <div className={css({ flex: 1, minWidth: 0 })}>
              <p className={css({ fontSize: "sm", fontWeight: 600, color: "text.primary", marginBottom: "1" })}>
                Day {i + 1} · {label(d)}
              </p>
              {readOnly ? (
                <p className={css({ fontSize: "sm", color: chosen ? "text.secondary" : "text.tertiary" })}>
                  {chosen ? chosen.name : "코디 미정"}
                </p>
              ) : (
                <select
                  value={oid}
                  onChange={(e) => change(d, e.target.value || null)}
                  className={css({
                    width: "100%",
                    height: "40px",
                    paddingX: "2",
                    bg: "surface.muted",
                    borderRadius: "sm",
                    fontSize: "sm",
                    color: "text.primary",
                    appearance: "none",
                    cursor: "pointer",
                    _focusVisible: { outline: "none" },
                  })}
                >
                  <option value="">코디 선택 안 함</option>
                  {outfits.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
