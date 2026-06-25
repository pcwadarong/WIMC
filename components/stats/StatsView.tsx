"use client";

import Link from "next/link";
import { primaryImageUrl } from "@/components/items/ItemCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { cardSurface } from "@/components/ui/styles";
import { categoryLabel } from "@/lib/constants/categories";
import { useStats } from "@/lib/queries/hooks";
import { css, cx } from "@/styled-system/css";

const card = cx(cardSurface, css({ padding: "5" }));
const sectionTitle = css({
  textStyle: "displaySm",
  color: "text.primary",
  marginBottom: "4",
});

function Bar({
  label,
  count,
  max,
  hex,
  valueLabel,
}: {
  label: string;
  count: number;
  max: number;
  hex?: string;
  valueLabel?: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
      <span
        className={css({
          display: "inline-flex",
          alignItems: "center",
          gap: "1.5",
          width: "72px",
          flexShrink: 0,
          fontSize: "sm",
          color: "text.secondary",
        })}
      >
        {hex && (
          <span
            className={css({
              width: "12px",
              height: "12px",
              borderRadius: "full",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "border",
              flexShrink: 0,
            })}
            style={{ background: hex }}
          />
        )}
        {label}
      </span>
      <span
        className={css({
          flex: 1,
          height: "10px",
          borderRadius: "full",
          bg: "surface.muted",
          overflow: "hidden",
        })}
      >
        <span
          className={css({ display: "block", height: "100%", bg: "brown.mid", borderRadius: "full" })}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span
        className={css({
          width: valueLabel ? "64px" : "28px",
          flexShrink: 0,
          textAlign: "right",
          fontSize: valueLabel ? "xs" : "sm",
          fontWeight: 600,
          color: "text.primary",
        })}
      >
        {valueLabel ?? count}
      </span>
    </div>
  );
}

function Thumb({ url, href }: { url: string | null; href: string }) {
  return (
    <Link
      href={href}
      className={css({
        position: "relative",
        flexShrink: 0,
        width: "64px",
        height: "64px",
        borderRadius: "md",
        overflow: "hidden",
        bg: "surface.muted",
      })}
    >
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={css({ width: "100%", height: "100%", objectFit: "cover" })} />
      )}
    </Link>
  );
}

export function StatsView() {
  const { data: s, isLoading } = useStats();

  if (isLoading || !s) {
    return (
      <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
        <Skeleton className={css({ height: "80px" })} />
        <Skeleton className={css({ height: "160px" })} />
        <Skeleton className={css({ height: "160px" })} />
      </div>
    );
  }

  if (s.itemCount === 0) {
    return (
      <p className={css({ marginTop: "12", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
        옷장을 채우면 분석이 시작돼요.
      </p>
    );
  }

  const catMax = Math.max(1, ...s.byCategory.map((c) => c.count));
  const colorMax = Math.max(1, ...s.byColor.map((c) => c.count));
  const monthMax = Math.max(1, ...s.monthlySpend.map((m) => m.total));
  const monthLabel = s.month.replace("-", ".");

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
      {/* 개수 (줄 표시) */}
      <p className={css({ fontSize: "sm", color: "text.secondary" })}>
        옷 <b className={css({ color: "text.primary" })}>{s.itemCount}</b> · 코디{" "}
        <b className={css({ color: "text.primary" })}>{s.outfitCount}</b> · 기록{" "}
        <b className={css({ color: "text.primary" })}>{s.logCount}</b>
      </p>

      {/* 이번 달 지출 + 브랜드별 */}
      <section className={card}>
        <div className={css({ display: "flex", alignItems: "baseline", justifyContent: "space-between" })}>
          <span className={css({ fontSize: "sm", color: "text.secondary" })}>{monthLabel} 지출</span>
          <span className={css({ textStyle: "xl", fontWeight: 800, color: "brown.dark" })}>
            {s.monthSpend.toLocaleString("ko-KR")}원
          </span>
        </div>
        {s.byBrand.length > 0 && (
          <div
            className={css({
              marginTop: "4",
              paddingTop: "4",
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "border",
              display: "flex",
              flexDirection: "column",
              gap: "2",
            })}
          >
            {s.byBrand.map((b) => (
              <div key={b.brand} className={css({ display: "flex", justifyContent: "space-between", fontSize: "sm" })}>
                <span className={css({ color: "text.secondary" })}>{b.brand}</span>
                <span className={css({ fontWeight: 600, color: "text.primary" })}>
                  {b.total.toLocaleString("ko-KR")}원
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 이번 달 많이 입은 옷 Top3 */}
      {s.topWorn.length > 0 && (
        <section className={card}>
          <h2 className={sectionTitle}>{monthLabel} 많이 입은 옷</h2>
          <div className={css({ display: "flex", gap: "3" })}>
            {s.topWorn.map((w, i) => (
              <div key={w.item.id} className={css({ flexShrink: 0, textAlign: "center" })}>
                <Thumb url={primaryImageUrl(w.item)} href={`/closet/${w.item.id}`} />
                <p className={css({ fontSize: "xs", fontWeight: 600, color: "text.primary", marginTop: "1.5" })}>
                  {i + 1}위 · {w.count}회
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 이번 달 착용 키워드 (실제 입은 옷 기반) */}
      {s.wornKeywords.length > 0 && (
        <section className={card}>
          <h2 className={sectionTitle}>{monthLabel} 착용 키워드</h2>
          <p className={css({ marginTop: "-2", marginBottom: "3", fontSize: "xs", color: "text.tertiary" })}>
            이번 달 실제로 입은 옷 기준 (마이의 선호 키워드와 비교해보세요)
          </p>
          <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
            {s.wornKeywords.map((k) => (
              <span
                key={k.label}
                className={css({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "1.5",
                  height: "32px",
                  paddingX: "3",
                  borderRadius: "full",
                  borderWidth: "1.5px",
                  borderStyle: "solid",
                  borderColor: "brown.dark",
                  bg: "accent.lavender",
                  fontSize: "sm",
                  fontWeight: 600,
                  color: "text.primary",
                })}
              >
                {k.label}
                <span className={css({ fontSize: "xs", color: "text.secondary" })}>{k.count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 카테고리 */}
      <section className={card}>
        <h2 className={sectionTitle}>Categories</h2>
        <div className={css({ display: "flex", flexDirection: "column", gap: "2.5" })}>
          {s.byCategory.map((c) => (
            <Bar key={c.label} label={categoryLabel(c.label)} count={c.count} max={catMax} />
          ))}
        </div>
      </section>

      {/* 색상 */}
      {s.byColor.length > 0 && (
        <section className={card}>
          <h2 className={sectionTitle}>Colors</h2>
          <div className={css({ display: "flex", flexDirection: "column", gap: "2.5" })}>
            {s.byColor.map((c) => (
              <Bar key={c.label} label={c.label} count={c.count} max={colorMax} hex={c.hex} />
            ))}
          </div>
        </section>
      )}

      {/* 월별 지출 추이 */}
      {s.monthlySpend.length > 0 && (
        <section className={card}>
          <h2 className={sectionTitle}>월별 지출</h2>
          <div className={css({ display: "flex", flexDirection: "column", gap: "2.5" })}>
            {s.monthlySpend.map((m) => (
              <Bar
                key={m.month}
                label={m.month.replace("-", ".")}
                count={m.total}
                max={monthMax}
                valueLabel={`${m.total.toLocaleString("ko-KR")}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* 착용당 비용 (가성비) */}
      {s.costPerWear.length > 0 && (
        <section className={card}>
          <h2 className={sectionTitle}>가성비 좋은 옷</h2>
          <div className={css({ display: "flex", gap: "2", overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } })}>
            {s.costPerWear.map((w) => (
              <div key={w.item.id} className={css({ flexShrink: 0, width: "64px", textAlign: "center" })}>
                <Thumb url={primaryImageUrl(w.item)} href={`/closet/${w.item.id}`} />
                <p className={css({ fontSize: "xs", fontWeight: 600, color: "text.primary", marginTop: "1" })}>
                  {w.cpw.toLocaleString("ko-KR")}원
                </p>
                <p className={css({ fontSize: "xs", color: "text.tertiary" })}>/{w.wears}회</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
