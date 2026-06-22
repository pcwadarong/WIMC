import Link from "next/link";
import { ChevronLeft, ChevronRight, Plane } from "lucide-react";
import { getMonthLogs } from "@/lib/data/logs";
import { getOutfits } from "@/lib/data/outfits";
import { getItems } from "@/lib/data/items";
import { primaryImageUrl } from "@/components/items/ItemCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { Fab } from "@/components/ui/Fab";
import type { DailyLog, Item, Outfit } from "@/types";
import { css } from "@/styled-system/css";

const pad = (n: number) => String(n).padStart(2, "0");
// 월요일 시작
const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m: mParam } = await searchParams;
  const now = new Date();
  const ym =
    mParam && /^\d{4}-\d{2}$/.test(mParam)
      ? mParam
      : `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const [y, m] = ym.split("-").map(Number);

  const [logs, outfits, items] = await Promise.all([
    getMonthLogs(ym),
    getOutfits(),
    getItems(),
  ]);

  const itemsById: Record<string, Item> = {};
  for (const it of items) itemsById[it.id] = it;
  const outfitsById: Record<string, Outfit> = {};
  for (const o of outfits) outfitsById[o.id] = o;

  const logsByDate: Record<string, DailyLog> = {};
  for (const l of logs) logsByDate[l.date] = l;

  const thumb = (log: DailyLog): string | null => {
    if (log.photo_url) return log.photo_url;
    if (log.outfit_id) {
      const o = outfitsById[log.outfit_id];
      const firstItem = (o?.item_ids ?? []).map((id) => itemsById[id]).find(Boolean);
      return firstItem ? primaryImageUrl(firstItem) : null;
    }
    return null;
  };

  // 월요일 시작 보정
  const firstWeekday = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const prev = m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <PageContainer>
      {/* 월 네비 */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "5",
        })}
      >
        <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
          <h1 className={css({ textStyle: "2xl", fontWeight: 800, color: "text.primary" })}>
            {y}.{pad(m)}.
          </h1>
          <Link href={`/calendar?m=${prev}`} aria-label="이전 달" className={css({ color: "text.tertiary", _hover: { color: "text.primary" } })}>
            <ChevronLeft size={20} />
          </Link>
          <Link href={`/calendar?m=${next}`} aria-label="다음 달" className={css({ color: "text.tertiary", _hover: { color: "text.primary" } })}>
            <ChevronRight size={20} />
          </Link>
        </div>
        <Link
          href="/trips"
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "1.5",
            fontSize: "sm",
            fontWeight: 500,
            color: "text.secondary",
            _hover: { color: "text.primary" },
          })}
        >
          <Plane size={16} />
          여행
        </Link>
      </div>

      {/* 요일 */}
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: "2",
        })}
      >
        {WEEKDAYS.map((w, i) => (
          <span
            key={w}
            className={css({
              textAlign: "center",
              fontSize: "xs",
              color: i === 6 ? "error" : "text.tertiary",
            })}
          >
            {w}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1.5",
        })}
      >
        {cells.map((d, idx) => {
          if (d === null) return <span key={`e${idx}`} />;
          const dateStr = `${ym}-${pad(d)}`;
          const log = logsByDate[dateStr];
          const t = log ? thumb(log) : null;
          const isToday = dateStr === todayStr;
          const isSunday = idx % 7 === 6;

          // 기록 있는 날 = 이미지(탭하면 상세). 빈 날 = 숫자만(비클릭)
          if (log) {
            return (
              <Link
                key={dateStr}
                href={`/calendar/${dateStr}`}
                className={css({
                  position: "relative",
                  aspectRatio: "3 / 4",
                  borderRadius: "md",
                  overflow: "hidden",
                  bg: "surface.muted",
                  display: "block",
                })}
              >
                {t && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t}
                    alt=""
                    className={css({
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    })}
                  />
                )}
                <span
                  className={css({
                    position: "absolute",
                    top: "1",
                    left: "1.5",
                    fontSize: "xs",
                    fontWeight: 700,
                    color: t ? "white" : "text.secondary",
                    textShadow: t ? "0 1px 3px rgba(0,0,0,0.6)" : "none",
                  })}
                >
                  {d}
                </span>
              </Link>
            );
          }

          return (
            <span
              key={dateStr}
              className={css({
                aspectRatio: "3 / 4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "sm",
                fontWeight: isToday ? 800 : 500,
                color: isToday
                  ? "brown.dark"
                  : isSunday
                    ? "error"
                    : "text.tertiary",
              })}
            >
              {d}
            </span>
          );
        })}
      </div>

      {/* 요약 */}
      <div
        className={css({
          marginTop: "8",
          paddingTop: "4",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "border",
          fontSize: "sm",
          color: "text.secondary",
        })}
      >
        이번 달 <b className={css({ color: "text.primary" })}>{logs.length}일</b> 기록
      </div>

      <Fab href="/calendar/new" label="기록 추가" />
    </PageContainer>
  );
}
