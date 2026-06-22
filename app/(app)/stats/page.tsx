import Link from "next/link";
import { getStats } from "@/lib/data/stats";
import { primaryImageUrl } from "@/components/items/ItemCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { cardSurface } from "@/components/ui/styles";
import { css, cx } from "@/styled-system/css";

const card = cx(cardSurface, css({ padding: "5" }));
const sectionTitle = css({
  textStyle: "lg",
  fontWeight: 700,
  color: "text.primary",
  marginBottom: "4",
});

function Bar({
  label,
  count,
  max,
  hex,
}: {
  label: string;
  count: number;
  max: number;
  hex?: string;
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
      <span className={css({ width: "28px", textAlign: "right", fontSize: "sm", fontWeight: 600, color: "text.primary" })}>
        {count}
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

export default async function StatsPage() {
  const s = await getStats();
  const catMax = Math.max(1, ...s.byCategory.map((c) => c.count));
  const colorMax = Math.max(1, ...s.byColor.map((c) => c.count));

  return (
    <PageContainer>
      <h1 className={css({ textStyle: "2xl", fontWeight: 700, color: "text.primary", marginBottom: "5" })}>
        분석
      </h1>

      {s.itemCount === 0 ? (
        <p className={css({ marginTop: "12", textAlign: "center", fontSize: "sm", color: "text.tertiary" })}>
          옷장을 채우면 분석이 시작돼요.
        </p>
      ) : (
        <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
          {/* 요약 */}
          <div className={css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3" })}>
            {[
              { label: "아이템", value: s.itemCount },
              { label: "코디", value: s.outfitCount },
              { label: "착용기록", value: s.logCount },
            ].map((x) => (
              <div key={x.label} className={cx(card, css({ textAlign: "center", paddingY: "4" }))}>
                <p className={css({ textStyle: "2xl", fontWeight: 800, color: "brown.dark" })}>{x.value}</p>
                <p className={css({ fontSize: "xs", color: "text.tertiary", marginTop: "1" })}>{x.label}</p>
              </div>
            ))}
          </div>

          {/* 카테고리 */}
          <section className={card}>
            <h2 className={sectionTitle}>카테고리 분포</h2>
            <div className={css({ display: "flex", flexDirection: "column", gap: "2.5" })}>
              {s.byCategory.map((c) => (
                <Bar key={c.label} label={c.label} count={c.count} max={catMax} />
              ))}
            </div>
          </section>

          {/* 색상 */}
          {s.byColor.length > 0 && (
            <section className={card}>
              <h2 className={sectionTitle}>많이 가진 색상</h2>
              <div className={css({ display: "flex", flexDirection: "column", gap: "2.5" })}>
                {s.byColor.map((c) => (
                  <Bar key={c.label} label={c.label} count={c.count} max={colorMax} hex={c.hex} />
                ))}
              </div>
            </section>
          )}

          {/* 브랜드 지출 */}
          {s.byBrand.length > 0 && (
            <section className={card}>
              <h2 className={sectionTitle}>브랜드별 지출</h2>
              <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
                {s.byBrand.map((b, i) => (
                  <div key={b.brand} className={css({ display: "flex", justifyContent: "space-between", fontSize: "sm" })}>
                    <span className={css({ color: "text.secondary" })}>
                      {i + 1}. {b.brand}
                    </span>
                    <span className={css({ fontWeight: 600, color: "text.primary" })}>
                      {b.total.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 자주 입은 옷 */}
          {s.topWorn.length > 0 && (
            <section className={card}>
              <h2 className={sectionTitle}>자주 입은 옷</h2>
              <div className={css({ display: "flex", gap: "2", overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } })}>
                {s.topWorn.map((w) => (
                  <div key={w.item.id} className={css({ flexShrink: 0, textAlign: "center" })}>
                    <Thumb url={primaryImageUrl(w.item)} href={`/closet/${w.item.id}`} />
                    <p className={css({ fontSize: "xs", color: "text.tertiary", marginTop: "1" })}>{w.count}회</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 안 입은 옷 발굴 */}
          {s.neverWorn.length > 0 && (
            <section className={card}>
              <h2 className={sectionTitle}>잠자는 옷 (한 번도 안 입음)</h2>
              <div className={css({ display: "flex", gap: "2", overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } })}>
                {s.neverWorn.map((it) => (
                  <Thumb key={it.id} url={primaryImageUrl(it)} href={`/closet/${it.id}`} />
                ))}
              </div>
            </section>
          )}

          {/* 스타일 키워드 */}
          {s.styleKeywords.length > 0 && (
            <section className={card}>
              <h2 className={sectionTitle}>내 스타일 키워드</h2>
              <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
                {s.styleKeywords.map((k) => (
                  <span
                    key={k}
                    className={css({
                      height: "32px",
                      paddingX: "3",
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "full",
                      bg: "surface.muted",
                      fontSize: "sm",
                      color: "text.secondary",
                    })}
                  >
                    #{k}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
