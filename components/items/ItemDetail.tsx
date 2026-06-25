import Image from "next/image";
import { Shirt } from "lucide-react";
import type { Item, SizeMeasurements } from "@/types";
import { SEASON_LABELS, ITEM_STATUS_LABELS } from "@/types";
import { cardSurface } from "@/components/ui/styles";
import { css, cx } from "@/styled-system/css";

const MEASUREMENT_LABELS: Record<keyof SizeMeasurements, string> = {
  shoulder: "어깨너비",
  chest: "가슴둘레",
  length: "총장",
  sleeve: "소매길이",
  waist: "허리둘레",
  hip: "힙둘레",
  thigh: "허벅지둘레",
  hem: "밑단둘레",
  rise: "밑위",
  inseam: "인심",
  foot: "발 길이(mm)",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className={css({
        display: "flex",
        justifyContent: "space-between",
        gap: "4",
        paddingY: "2.5",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "border",
      })}
    >
      <span
        className={css({ fontSize: "sm", color: "text.secondary", flexShrink: 0 })}
      >
        {label}
      </span>
      <span
        className={css({
          fontSize: "sm",
          color: "text.primary",
          textAlign: "right",
        })}
      >
        {children}
      </span>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cx(
        cardSurface,
        css({ marginTop: "6", paddingX: "5", paddingY: "2" }),
      )}
    >
      <h2
        className={css({
          fontSize: "sm",
          fontWeight: 700,
          color: "text.secondary",
          paddingTop: "3",
          paddingBottom: "1",
        })}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ItemDetail({
  item,
  categoryLabel,
  wears,
}: {
  item: Item;
  categoryLabel: string | null;
  wears?: { total: number; month: number };
}) {
  const images = item.images ?? [];
  const ordered = [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary),
  );
  const measurements = item.size_info?.measurements ?? {};
  const measurementEntries = Object.entries(measurements).filter(
    ([, v]) => v != null,
  ) as [keyof SizeMeasurements, number][];

  const hasPurchase =
    item.brand || item.purchase_from || item.purchase_price || item.purchase_date;
  const hasSize =
    item.size_info &&
    (item.size_info.label ||
      item.size_info.numeric ||
      item.size_info.us ||
      item.size_info.uk ||
      item.size_info.jp ||
      item.size_info.eu ||
      measurementEntries.length > 0);

  return (
    <div className={css({ paddingX: "5", paddingBottom: "10" })}>
      {/* 이미지 */}
      {ordered.length > 0 ? (
        <div
          className={css({
            display: "flex",
            gap: "2",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            marginX: "-5",
            paddingX: "5",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          })}
        >
          {ordered.map((img, i) => (
            <div
              key={i}
              className={css({
                position: "relative",
                flexShrink: 0,
                width: ordered.length > 1 ? "78%" : "100%",
                aspectRatio: "1",
                borderRadius: "md",
                overflow: "hidden",
                bg: "surface.muted",
                scrollSnapAlign: "start",
              })}
            >
              <Image
                src={img.url}
                alt={item.name}
                fill
                sizes="430px"
                className={css({ objectFit: "cover" })}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            aspectRatio: "1",
            borderRadius: "md",
            bg: "surface.muted",
            color: "text.tertiary",
          })}
        >
          <Shirt size={48} strokeWidth={1.5} />
        </div>
      )}

      {/* 제목 */}
      <div className={css({ marginTop: "5" })}>
        <h1
          className={css({
            textStyle: "displayMd",
            color: "text.primary",
          })}
        >
          {item.name}
        </h1>
        {item.brand && (
          <p
            className={css({
              marginTop: "1",
              fontSize: "base",
              color: "text.secondary",
            })}
          >
            {item.brand}
          </p>
        )}
        {wears && (
          <span
            className={css({
              display: "inline-flex",
              alignItems: "center",
              marginTop: "3",
              height: "28px",
              paddingX: "3",
              borderRadius: "full",
              borderWidth: "1.5px",
              borderStyle: "solid",
              borderColor: "brown.dark",
              bg: "accent.green",
              fontSize: "xs",
              fontWeight: 600,
              color: "text.primary",
            })}
          >
            착용 {wears.total}회{wears.month > 0 ? ` · 이번 달 ${wears.month}회` : ""}
          </span>
        )}
      </div>

      {/* 기본 정보 */}
      <Card title="기본 정보">
        {item.status && (
          <Row label="상태">{ITEM_STATUS_LABELS[item.status]}</Row>
        )}
        {categoryLabel && <Row label="카테고리">{categoryLabel}</Row>}
        {item.colors && item.colors.length > 0 && (
          <Row label="색상">
            <span
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "2",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              })}
            >
              {item.colors.map((c) => (
                <span
                  key={c.hex}
                  className={css({
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "1",
                  })}
                >
                  <span
                    className={css({
                      width: "14px",
                      height: "14px",
                      borderRadius: "full",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "border",
                    })}
                    style={{ background: c.hex }}
                  />
                  {c.label}
                </span>
              ))}
            </span>
          </Row>
        )}
        {item.material && <Row label="소재">{item.material}</Row>}
        {item.season && <Row label="시즌">{SEASON_LABELS[item.season]}</Row>}
        {item.memo && <Row label="메모">{item.memo}</Row>}
      </Card>

      {/* 구매 정보 */}
      {hasPurchase && (
        <Card title="구매 정보">
          {item.purchase_from && <Row label="구매처">{item.purchase_from}</Row>}
          {item.purchase_price != null && (
            <Row label="가격">
              {item.purchase_price.toLocaleString("ko-KR")}원
            </Row>
          )}
          {item.purchase_date && <Row label="구매일">{item.purchase_date}</Row>}
        </Card>
      )}

      {/* 사이즈 */}
      {hasSize && item.size_info && (
        <Card title="사이즈">
          {item.size_info.label && <Row label="라벨">{item.size_info.label}</Row>}
          {item.size_info.numeric && (
            <Row label="숫자">{item.size_info.numeric}</Row>
          )}
          {(["us", "uk", "jp", "eu"] as const).map((k) =>
            item.size_info?.[k] ? (
              <Row key={k} label={k.toUpperCase()}>
                {item.size_info[k]}
              </Row>
            ) : null,
          )}
          {measurementEntries.map(([key, v]) => (
            <Row key={key} label={MEASUREMENT_LABELS[key]}>
              {v} cm
            </Row>
          ))}
        </Card>
      )}
    </div>
  );
}
