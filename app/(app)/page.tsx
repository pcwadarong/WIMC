import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ItemCard } from "@/components/items/ItemCard";
import { TodayPanel } from "@/components/home/TodayPanel";
import { getItems } from "@/lib/data/items";
import { getCategoryTree } from "@/lib/data/categories";
import { getProfile } from "@/lib/data/profile";
import { getLog } from "@/lib/data/logs";
import { getOutfit } from "@/lib/data/outfits";
import { createClient } from "@/lib/supabase/server";
import { buildProfileNote } from "@/lib/profile-note";
import { buildCategoryMap } from "@/lib/utils/category";
import { primaryImageUrl, indexById } from "@/lib/utils/item";
import { css } from "@/styled-system/css";

const pad = (n: number) => String(n).padStart(2, "0");

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name = user?.user_metadata?.username ?? user?.email?.split("@")[0];

  const now = new Date();
  const yd = new Date(now);
  yd.setDate(now.getDate() - 1);
  const yStr = `${yd.getFullYear()}-${pad(yd.getMonth() + 1)}-${pad(yd.getDate())}`;

  const [items, categories, profile, yLog] = await Promise.all([
    getItems(),
    getCategoryTree(),
    getProfile(),
    getLog(yStr),
  ]);
  const profileNote = buildProfileNote(profile);
  const categoryMap = buildCategoryMap(categories);
  const recent = items.slice(0, 3);

  // 어제 입은 코디 썸네일
  let yThumb: string | null = null;
  let yName: string | null = null;
  if (yLog?.photo_url) {
    yThumb = yLog.photo_url;
  } else if (yLog?.outfit_id) {
    const o = await getOutfit(yLog.outfit_id);
    const itemsById = indexById(items);
    const first = (o?.item_ids ?? []).map((id) => itemsById[id]).find(Boolean);
    yThumb = first ? primaryImageUrl(first) : null;
    yName = o?.name ?? null;
  }

  return (
    <PageContainer>
      <div>
        <p className={css({ textStyle: "sm", color: "text.secondary" })}>
          안녕하세요{name ? `, ${name}님` : ""}
        </p>
        <h1
          className={css({
            textStyle: "3xl",
            fontWeight: 700,
            color: "text.primary",
            marginTop: "3",
          })}
        >
          오늘 뭐 입지?
        </h1>
      </div>

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
              textStyle: "lg",
              fontWeight: 700,
              color: "text.primary",
              marginBottom: "4",
            })}
          >
            어제 입은 코디
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
                  className={css({
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  })}
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

      {recent.length > 0 && (
        <section className={css({ marginTop: "10" })}>
          <div
            className={css({
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "4",
            })}
          >
            <h2
              className={css({
                textStyle: "lg",
                fontWeight: 700,
                color: "text.primary",
              })}
            >
              최근 등록
            </h2>
            <Link
              href="/closet"
              className={css({ fontSize: "sm", color: "text.secondary" })}
            >
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
            {recent.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
