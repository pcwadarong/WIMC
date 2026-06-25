"use client";

import Link from "next/link";
import { MapPin, Calendar as CalIcon } from "lucide-react";
import { useTrips } from "@/lib/queries/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { css } from "@/styled-system/css";

export function TripsList() {
  const { data: trips = [], isLoading } = useTrips();

  if (isLoading) {
    return (
      <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className={css({ height: "84px" })} />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <p className={css({ marginTop: "12", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
        아직 여행이 없어요. + 버튼으로 만들어보세요.
      </p>
    );
  }

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
      {trips.map((t) => (
        <Link
          key={t.id}
          href={`/trips/${t.id}`}
          className={css({
            display: "block",
            bg: "surface",
            borderRadius: "md",
            boxShadow: "card",
            padding: "4",
          })}
        >
          <p className={css({ fontSize: "lg", fontWeight: 700, letterSpacing: "-0.01em", color: "text.primary" })}>
            {t.name}
          </p>
          <div className={css({ display: "flex", gap: "4", marginTop: "1", fontSize: "sm", color: "text.secondary" })}>
            {t.destination && (
              <span className={css({ display: "inline-flex", alignItems: "center", gap: "1" })}>
                <MapPin size={14} />
                {t.destination}
              </span>
            )}
            {t.start_date && (
              <span className={css({ display: "inline-flex", alignItems: "center", gap: "1" })}>
                <CalIcon size={14} />
                {t.start_date}
                {t.end_date ? ` ~ ${t.end_date}` : ""}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
