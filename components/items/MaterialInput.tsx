"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { css } from "@/styled-system/css";

interface Row {
  id: string;
  name: string;
  percent: string;
}

const PRESETS = [
  "면",
  "폴리에스터",
  "아크릴",
  "울",
  "나일론",
  "린넨",
  "레이온",
  "스판덱스",
  "캐시미어",
  "텐셀",
  "데님",
  "가죽",
];

/** "면 60% · 폴리에스터 40%" 문자열을 행으로 파싱 */
function parseInitial(initial?: string): Row[] {
  const trimmed = (initial ?? "").trim();
  if (!trimmed) return [{ id: "m0", name: "", percent: "" }];
  return trimmed.split("·").map((tok, i) => {
    const t = tok.trim();
    const m = t.match(/^(.*?)\s+(\d+(?:\.\d+)?)%$/);
    return m
      ? { id: `m${i}`, name: m[1].trim(), percent: m[2] }
      : { id: `m${i}`, name: t, percent: "" };
  });
}

/** 소재 + 혼용률 입력. 부모에는 "면 60% · 폴리에스터 40%" 형태의 문자열로 전달 */
export function MaterialInput({
  initial,
  onChange,
}: {
  initial?: string;
  onChange: (value: string) => void;
}) {
  const initialRows = parseInitial(initial);
  // 결정적 초기 id (SSR/CSR 일치) + 이후 증가 카운터
  const counter = useRef(initialRows.length);
  const [rows, setRows] = useState<Row[]>(initialRows);

  const emit = (next: Row[]) => {
    const str = next
      .filter((r) => r.name.trim())
      .map((r) =>
        r.percent.trim() ? `${r.name.trim()} ${r.percent.trim()}%` : r.name.trim(),
      )
      .join(" · ");
    onChange(str);
  };

  const update = (id: string, patch: Partial<Row>) => {
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    setRows(next);
    emit(next);
  };

  const add = () => {
    setRows((prev) => [
      ...prev,
      { id: `m${counter.current++}`, name: "", percent: "" },
    ]);
  };

  const remove = (id: string) => {
    const next = rows.length > 1 ? rows.filter((r) => r.id !== id) : rows;
    setRows(next);
    emit(next);
  };

  const total = rows.reduce((sum, r) => sum + (Number(r.percent) || 0), 0);

  const cell = css({
    height: "44px",
    paddingX: "3",
    bg: "surface.muted",
    borderRadius: "sm",
    fontSize: "sm",
    color: "text.primary",
    _placeholder: { color: "text.tertiary" },
    _focusVisible: { outline: "none" },
  });

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "2" })}>
      {rows.map((row) => (
        <div
          key={row.id}
          className={css({ display: "flex", alignItems: "center", gap: "2" })}
        >
          <input
            list="material-presets"
            aria-label="소재 이름"
            value={row.name}
            onChange={(e) => update(row.id, { name: e.target.value })}
            placeholder="소재 (예: 면)"
            className={cell}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            inputMode="numeric"
            aria-label="혼용률 (%)"
            value={row.percent}
            onChange={(e) => update(row.id, { percent: e.target.value })}
            placeholder="%"
            className={cell}
            style={{ width: "72px" }}
          />
          <button
            type="button"
            onClick={() => remove(row.id)}
            aria-label="소재 삭제"
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              color: "text.tertiary",
              cursor: "pointer",
              flexShrink: 0,
            })}
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <datalist id="material-presets">
        {PRESETS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        })}
      >
        <button
          type="button"
          onClick={add}
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "1",
            fontSize: "sm",
            color: "brown.mid",
            fontWeight: 500,
            cursor: "pointer",
          })}
        >
          <Plus size={16} />
          소재 추가
        </button>
        {total > 0 && (
          <span
            className={css({
              fontSize: "xs",
              color: total === 100 ? "success" : "text.tertiary",
            })}
          >
            합계 {total}%
          </span>
        )}
      </div>
    </div>
  );
}
