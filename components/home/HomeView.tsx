"use client";

import { useMemo } from "react";
import Link from "next/link";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { TodayPanel } from "@/components/home/TodayPanel";
import {
  useItems,
  useOutfits,
  useCategories,
  useProfile,
  useLog,
} from "@/lib/queries/hooks";
import { buildProfileNote } from "@/lib/profile-note";
import { buildCategoryMap } from "@/lib/utils/category";
import { primaryImageUrl, indexById } from "@/lib/utils/item";
import { css } from "@/styled-system/css";

const pad = (n: number) => String(n).padStart(2, "0");

export function HomeView() {
  const now = new Date();
  const yd = new Date(now);
  yd.setDate(now.getDate() - 1);
  const yStr = `${yd.getFullYear()}-${pad(yd.getMonth() + 1)}-${pad(yd.getDate())}`;

  const { data: items = [] } = useItems();
  const { data: outfits = [] } = useOutfits();
  const { data: categories = [] } = useCategories();
  const { data: profile } = useProfile();
  const { data: yLog } = useLog(yStr);

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);
  const itemsById = useMemo(() => indexById(items), [items]);
  const profileNote = useMemo(() => buildProfileNote(profile ?? null), [profile]);
  const recentOutfits = outfits.slice(0, 3);

  // 어제 입은 코디 썸네일 (코디 목록에서 조회)
  let yThumb: string | null = null;
  let yName: string | null = null;
  if (yLog?.photo_url) {
    yThumb = yLog.photo_url;
  } else if (yLog?.outfit_id) {
    const o = outfits.find((x) => x.id === yLog.outfit_id);
    const first = (o?.item_ids ?? []).map((id) => itemsById[id]).find(Boolean);
    yThumb = first ? primaryImageUrl(first) : null;
    yName = o?.name ?? null;
  }

  return (
    <>
      <TodayPanel
        items={items}
        categoryMap={categoryMap}
        profileNote={profileNote}
        location={profile?.location ?? null}
      />

      {yLog && (
        <section className={css({ marginTop: "10" })}>
          <h2
            className={css({
              textStyle: "displaySm",
              color: "text.primary",
              marginBottom: "4",
            })}
          >
            Yesterday
          </h2>
          <Link
            href={`/calendar/${yStr}`}
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "4",
              bg: "surface",
              borderRadius: "md",
              boxShadow: "card",
              padding: "3",
            })}
          >
            <div
              className={css({
                position: "relative",
                width: "60px",
                height: "60px",
                borderRadius: "sm",
                overflow: "hidden",
                bg: "surface.muted",
                flexShrink: 0,
              })}
            >
              {yThumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={yThumb}
                  alt=""
                  className={css({ width: "100%", height: "100%", objectFit: "cover" })}
                />
              )}
            </div>
            <div className={css({ minWidth: 0 })}>
              <p className={css({ fontSize: "sm", fontWeight: 600, color: "text.primary" })}>
                {yName || (yLog.photo_url ? "어제 기록" : "코디")}
              </p>
              {yLog.memo && (
                <p
                  className={css({
                    fontSize: "sm",
                    color: "text.tertiary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  })}
                >
                  {yLog.memo}
                </p>
              )}
            </div>
          </Link>
        </section>
      )}

      {recentOutfits.length > 0 && (
        <section className={css({ marginTop: "10" })}>
          <div
            className={css({
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "4",
            })}
          >
            <h2 className={css({ textStyle: "displaySm", color: "text.primary" })}>
              Recent
            </h2>
            <Link href="/outfits" className={css({ fontSize: "sm", color: "text.secondary" })}>
              전체 보기
            </Link>
          </div>
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "3",
            })}
          >
            {recentOutfits.map((o) => (
              <OutfitCard key={o.id} outfit={o} itemsById={itemsById} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
