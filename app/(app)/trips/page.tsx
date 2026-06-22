import Link from "next/link";
import { MapPin, Calendar as CalIcon } from "lucide-react";
import { getTrips } from "@/lib/data/trips";
import { PageContainer } from "@/components/layout/PageContainer";
import { Fab } from "@/components/ui/Fab";
import { TopBar } from "@/components/layout/TopBar";
import { css } from "@/styled-system/css";

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <>
      <TopBar back title="여행" />
      <PageContainer>
        {trips.length === 0 ? (
          <p className={css({ marginTop: "12", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
            아직 여행이 없어요. + 버튼으로 만들어보세요.
          </p>
        ) : (
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
                <p className={css({ textStyle: "lg", fontWeight: 700, color: "text.primary" })}>
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
        )}

        <Fab href="/trips/new" label="여행 추가" />
      </PageContainer>
    </>
  );
}
