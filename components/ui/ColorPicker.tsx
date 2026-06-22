"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { PRESET_COLORS } from "@/lib/constants/colors";
import type { ColorValue } from "@/types";
import { chipClass } from "@/components/ui/styles";
import { css } from "@/styled-system/css";

interface ColorPickerProps {
  value: ColorValue[];
  onChange: (colors: ColorValue[]) => void;
}

const grid = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "2",
});

// 항상 1.5px 테두리를 유지해 선택 시 크기/모양이 변하지 않게 함 (단일 css로 active 충돌 방지)
const chip = (active: boolean) =>
  chipClass({ active, variant: "outline", size: "sm" });

const swatch = css({
  width: "16px",
  height: "16px",
  borderRadius: "full",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  flexShrink: 0,
});

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState("#2C1A0E");
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
      <div className={grid}>
        {PRESET_COLORS.map((c) => {
          const active = has(c.hex);
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => toggle(c)}
              className={chip(active)}
            >
              <span className={swatch} style={{ background: c.hex }} />
              {c.label}
              {active && <Check size={14} />}
            </button>
          );
        })}

        {/* 직접 선택한 커스텀 색상 칩 */}
        {customSelected.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => toggle(c)}
            className={chip(true)}
          >
            <span className={swatch} style={{ background: c.hex }} />
            {c.label}
            <Check size={14} />
          </button>
        ))}

        {/* 직접 입력 토글 */}
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className={chip(showCustom)}
        >
          <Plus size={14} />
          직접 입력
        </button>
      </div>

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
              borderRadius: "sm",
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
              bg: "surface.muted",
              borderRadius: "sm",
              fontSize: "sm",
              color: "text.primary",
              _placeholder: { color: "text.tertiary" },
              _focusVisible: { outline: "none" },
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
              borderRadius: "full",
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
