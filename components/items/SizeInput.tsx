"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SizeInfo, SizeMeasurements } from "@/types";
import { css, cx } from "@/styled-system/css";

interface SizeInputProps {
  value: SizeInfo;
  onChange: (size: SizeInfo) => void;
  /** 대분류 이름 (상의/하의/신발/가방/악세서리) */
  category?: string;
}

const LABELS: Record<keyof SizeMeasurements, string> = {
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

// 카테고리별 실측 항목
const SETS: Record<string, (keyof SizeMeasurements)[]> = {
  상의: ["shoulder", "chest", "length", "sleeve"],
  하의: ["waist", "hip", "thigh", "hem", "rise", "inseam"],
  신발: ["foot"],
};

const cell = css({
  height: "44px",
  paddingX: "3",
  bg: "surface.muted",
  borderRadius: "sm",
  fontSize: "sm",
  color: "text.primary",
  width: "100%",
  _placeholder: { color: "text.tertiary" },
  _focusVisible: { outline: "none" },
});

const miniLabel = css({
  fontSize: "xs",
  color: "text.secondary",
  marginBottom: "1",
  display: "block",
});

export function SizeInput({ value, onChange, category }: SizeInputProps) {
  const [open, setOpen] = useState(false);

  const set = (patch: Partial<SizeInfo>) => onChange({ ...value, ...patch });
  const setM = (key: keyof SizeMeasurements, v: string) => {
    const num = v === "" ? undefined : Number(v);
    const measurements = { ...(value.measurements ?? {}) };
    if (num === undefined || Number.isNaN(num)) delete measurements[key];
    else measurements[key] = num;
    onChange({ ...value, measurements });
  };

  const isAccessoryLike = category === "가방" || category === "악세서리";
  const showIntl = !isAccessoryLike;
  const measSet = category ? (SETS[category] ?? []) : [];

  const labelPlaceholder =
    category === "신발" ? "250 / 260" : category === "하의" ? "28 / 30" : "S / M / L";

  // 가방·악세서리: 라벨만
  if (isAccessoryLike) {
    return (
      <div>
        <span className={miniLabel}>사이즈 (선택)</span>
        <input
          className={cell}
          placeholder="예: FREE / 미니 / 라지"
          value={value.label ?? ""}
          onChange={(e) => set({ label: e.target.value })}
        />
      </div>
    );
  }

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
      <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2" })}>
        <div>
          <span className={miniLabel}>라벨</span>
          <input
            className={cell}
            placeholder={labelPlaceholder}
            value={value.label ?? ""}
            onChange={(e) => set({ label: e.target.value })}
          />
        </div>
        <div>
          <span className={miniLabel}>숫자</span>
          <input
            className={cell}
            placeholder={category === "신발" ? "255" : "26 / 28"}
            value={value.numeric ?? ""}
            onChange={(e) => set({ numeric: e.target.value })}
          />
        </div>
      </div>

      {showIntl && (
        <div className={css({ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2" })}>
          {(["us", "uk", "jp", "eu"] as const).map((k) => (
            <div key={k}>
              <span className={miniLabel}>{k.toUpperCase()}</span>
              <input
                className={cell}
                value={value[k] ?? ""}
                onChange={(e) => set({ [k]: e.target.value } as Partial<SizeInfo>)}
              />
            </div>
          ))}
        </div>
      )}

      {!category && (
        <p className={css({ fontSize: "xs", color: "text.tertiary" })}>
          카테고리를 선택하면 그에 맞는 실측 항목이 표시돼요.
        </p>
      )}

      {measSet.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "44px",
              paddingX: "3",
              bg: "surface.muted",
              borderRadius: "sm",
              fontSize: "sm",
              color: "text.secondary",
              cursor: "pointer",
            })}
          >
            실측 입력 ({category}) {category === "신발" ? "" : "(cm)"}
            <ChevronDown
              size={18}
              className={cx(
                css({ transition: "transform 0.15s ease" }),
                open && css({ transform: "rotate(180deg)" }),
              )}
            />
          </button>

          {open && (
            <div className={css({ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2" })}>
              {measSet.map((key) => (
                <div key={key}>
                  <span className={miniLabel}>{LABELS[key]}</span>
                  <input
                    className={cell}
                    type="number"
                    inputMode="decimal"
                    value={value.measurements?.[key] ?? ""}
                    onChange={(e) => setM(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
