"use client";

import { useMemo } from "react";
import Link from "next/link";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { TodayPanel } from "@/components/home/TodayPanel";
import { SeeMore } from "@/components/ui/SeeMore";
import { Thumb } from "@/components/ui/Thumb";
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
  if (yLog?.photos?.length) {
    yThumb = yLog.photos[0];
  } else if (yLog?.outfit_id || (yLog?.item_ids?.length ?? 0) > 0) {
    const o = yLog?.outfit_id ? outfits.find((x) => x.id === yLog.outfit_id) : undefined;
    const ids = o ? o.item_ids ?? [] : yLog?.item_ids ?? [];
    const first = ids.map((id) => itemsById[id]).find(Boolean);
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
            <Thumb
              src={yThumb}
              radius="sm"
              outlined
              iconSize={22}
              className={css({ width: "60px", flexShrink: 0 })}
            />
            <div className={css({ minWidth: 0 })}>
              <p className={css({ fontSize: "sm", fontWeight: 600, color: "text.primary" })}>
                {yName || (yLog.photos?.length ? "어제 기록" : "코디")}
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
            <SeeMore href="/outfits">전체 보기</SeeMore>
          </div>
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "4",
            })}
          >
            {recentOutfits.map((o) => (
              <OutfitCard key={o.id} outfit={o} itemsById={itemsById} heartSize={15} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
