"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plane } from "lucide-react";
import { SeeMore } from "@/components/ui/SeeMore";
import { primaryImageUrl } from "@/components/items/ItemCard";
import { Fab } from "@/components/ui/Fab";
import {
  useMonthLogs,
  useMonthItemSummary,
  useOutfits,
  useItems,
} from "@/lib/queries/hooks";
import { indexById } from "@/lib/utils/item";
import type { DailyLog } from "@/types";
import { css } from "@/styled-system/css";

const pad = (n: number) => String(n).padStart(2, "0");
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView() {
  const sp = useSearchParams();
  const mParam = sp.get("m");
  const now = new Date();
  const ym =
    mParam && /^\d{4}-\d{2}$/.test(mParam)
      ? mParam
      : `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const [y, m] = ym.split("-").map(Number);

  const { data: logs = [] } = useMonthLogs(ym);
  const { data: summary } = useMonthItemSummary(ym);

  // 썸네일은 코디/즉석조합 기반 기록이 있을 때만 outfits/items 조회
  const needsOutfitThumbs = logs.some(
    (l) => !(l.photos?.length) && (l.outfit_id || (l.item_ids?.length ?? 0) > 0),
  );
  const { data: outfits = [] } = useOutfits({ enabled: needsOutfitThumbs });
  const { data: items = [] } = useItems(undefined, { enabled: needsOutfitThumbs });

  const itemsById = indexById(items);
  const outfitsById = indexById(outfits);
  const logsByDate: Record<string, DailyLog> = {};
  for (const l of logs) logsByDate[l.date] = l;

  const monthAdded = summary?.added ?? 0;
  const monthSpend = summary?.spend ?? 0;

  const thumb = (log: DailyLog): string | null => {
    if (log.photos?.length) return log.photos[0];
    const ids = log.outfit_id
      ? outfitsById[log.outfit_id]?.item_ids ?? []
      : log.item_ids ?? [];
    const firstItem = ids.map((id) => itemsById[id]).find(Boolean);
    return firstItem ? primaryImageUrl(firstItem) : null;
  };

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
    <>
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
          <h1 className={css({ textStyle: "displayMd", color: "text.primary" })}>
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
            height: "36px",
            paddingX: "3.5",
            borderRadius: "full",
            bg: "accent.blue",
            borderWidth: "1.5px",
            borderStyle: "solid",
            borderColor: "brown.dark",
            fontSize: "sm",
            fontWeight: 600,
            color: "text.primary",
            transition: "transform 0.1s ease",
            _active: { transform: "scale(0.97)" },
          })}
        >
          <Plane size={15} />
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

      {/* 이번 달 분석 요약 */}
      <section
        className={css({
          marginTop: "8",
          bg: "surface",
          borderRadius: "md",
          boxShadow: "card",
          padding: "5",
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2",
            marginBottom: "4",
          })}
        >
          <h2 className={css({ textStyle: "displaySm", color: "text.primary" })}>
            This Month
          </h2>
          <SeeMore href="/stats">전체 분석</SeeMore>
        </div>
        <div className={css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2" })}>
          {[
            { label: "착용 기록", value: `${logs.length}일` },
            { label: "등록", value: `${monthAdded}개` },
            { label: "지출", value: `${monthSpend.toLocaleString("ko-KR")}원` },
          ].map((x) => (
            <div key={x.label} className={css({ textAlign: "center" })}>
              <p className={css({ textStyle: "lg", fontWeight: 800, color: "brown.dark" })}>
                {x.value}
              </p>
              <p className={css({ fontSize: "xs", color: "text.tertiary", marginTop: "0.5" })}>
                {x.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Fab href="/calendar/new" label="기록 추가" />
    </>
  );
}
