"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PRESET_COLORS } from "@/lib/constants/colors";
import type { ColorValue } from "@/types";
import { css, cx } from "@/styled-system/css";

interface ColorPickerProps {
  value: ColorValue[];
  onChange: (colors: ColorValue[]) => void;
}

const row = css({ display: "flex", flexWrap: "wrap", gap: "2.5" });

// 동그라미 스와치 (레퍼런스 color radio selector). 선택 시 블랙 링.
const dot = css({
  width: "36px",
  height: "36px",
  borderRadius: "full",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  cursor: "pointer",
  flexShrink: 0,
  transition: "outline 0.1s ease",
  _focusVisible: { outline: "2px solid token(colors.border.focus)", outlineOffset: "2px" },
});

const dotSelected = css({
  outline: "2px solid token(colors.brown.dark)",
  outlineOffset: "2px",
});

const addDot = cx(
  dot,
  css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    bg: "surface",
    borderStyle: "dashed",
    color: "text.secondary",
    _hover: { borderColor: "brown.dark", color: "brown.dark" },
  }),
);

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState("#1A1A1A");
  const [customLabel, setCustomLabel] = useState("");

  const has = (hex: string) =>
    value.some((c) => c.hex.toLowerCase() === hex.toLowerCase());

  const toggle = (color: ColorValue) => {
    if (has(color.hex)) {
      onChange(value.filter((c) => c.hex.toLowerCase() !== color.hex.toLowerCase()));
    } else {
      onChange([...value, color]);
    }
  };

  const addCustom = () => {
    const label = customLabel.trim() || customHex.toUpperCase();
    if (has(customHex)) return;
    onChange([...value, { label, hex: customHex }]);
    setCustomLabel("");
    setShowCustom(false);
  };

  const customSelected = value.filter(
    (v) => !PRESET_COLORS.some((p) => p.hex.toLowerCase() === v.hex.toLowerCase()),
  );

  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
      <div className={row}>
        {PRESET_COLORS.map((c) => {
          const active = has(c.hex);
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => toggle(c)}
              aria-pressed={active}
              aria-label={c.label}
              title={c.label}
              className={cx(dot, active && dotSelected)}
              style={{ background: c.hex }}
            />
          );
        })}

        {/* 직접 선택한 커스텀 색상 */}
        {customSelected.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => toggle(c)}
            aria-pressed
            aria-label={c.label}
            title={c.label}
            className={cx(dot, dotSelected)}
            style={{ background: c.hex }}
          />
        ))}

        {/* 직접 입력 토글 */}
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          aria-label="색상 직접 추가"
          className={addDot}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 선택된 색 이름 (데이터 명확성) */}
      {value.length > 0 && (
        <p className={css({ fontSize: "xs", color: "text.secondary" })}>
          {value.map((c) => c.label).join(", ")}
        </p>
      )}

      {showCustom && (
        <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
          <input
            type="color"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            aria-label="색상 직접 선택"
            className={css({
              width: "44px",
              height: "44px",
              padding: 0,
              border: "none",
              borderRadius: "xs",
              bg: "transparent",
              cursor: "pointer",
              flexShrink: 0,
            })}
          />
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="색상 이름 (예: 라벤더)"
            className={css({
              flex: 1,
              height: "44px",
              paddingX: "3",
              bg: "surface",
              borderRadius: "xs",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "border",
              fontSize: "sm",
              color: "text.primary",
              _placeholder: { color: "text.tertiary" },
              _focusVisible: {
                outline: "2px solid token(colors.border.focus)",
                outlineOffset: "0",
              },
            })}
          />
          <button
            type="button"
            onClick={addCustom}
            className={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "1",
              height: "44px",
              paddingX: "4",
              borderRadius: "xs",
              bg: "brown.dark",
              color: "white",
              fontSize: "sm",
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              _hover: { bg: "brown.mid" },
            })}
          >
            추가
          </button>
        </div>
      )}
    </div>
  );
}
