"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Shirt, CopyCheck, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ItemCard, primaryImageUrl } from "@/components/items/ItemCard";
import { buildClosetSelectionPrompt, type CategoryMap } from "@/lib/recommend";
import type { Item } from "@/types";
import { css } from "@/styled-system/css";

export function ClosetGrid({
  items,
  categoryMap,
  profileNote,
}: {
  items: Item[];
  categoryMap: CategoryMap;
  profileNote?: string;
}) {
  const { show } = useToast();
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const exit = () => {
    setSelectMode(false);
    setSelected([]);
  };

  const copy = async () => {
    const chosen = items.filter((i) => selected.includes(i.id));
    if (chosen.length === 0) return;
    try {
      await navigator.clipboard.writeText(
        buildClosetSelectionPrompt(chosen, categoryMap, profileNote),
      );
      show(`${chosen.length}개로 만든 프롬프트를 복사했어요.`, "success");
      exit();
    } catch {
      show("복사에 실패했어요.", "error");
    }
  };

  return (
    <>
      {/* 선택 모드 토글 */}
      <div
        className={css({
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "4",
          marginBottom: "3",
        })}
      >
        <button
          type="button"
          onClick={() => (selectMode ? exit() : setSelectMode(true))}
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "1.5",
            fontSize: "sm",
            fontWeight: 500,
            color: selectMode ? "brown.dark" : "text.secondary",
            cursor: "pointer",
          })}
        >
          <CopyCheck size={16} />
          {selectMode ? "취소" : "선택해서 AI 추천"}
        </button>
      </div>

      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "4",
          paddingBottom: selectMode ? "24" : "0",
        })}
      >
        {items.map((item) => {
          if (!selectMode) return <ItemCard key={item.id} item={item} />;
          const url = primaryImageUrl(item);
          const on = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={css({ display: "block", textAlign: "left", cursor: "pointer" })}
            >
              <div
                className={css({
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "md",
                  overflow: "hidden",
                  bg: "surface.muted",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderColor: on ? "brown.dark" : "transparent",
                })}
              >
                {url ? (
                  <Image src={url} alt={item.name} fill sizes="50vw" className={css({ objectFit: "cover" })} />
                ) : (
                  <span className={css({ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "text.tertiary" })}>
                    <Shirt size={28} />
                  </span>
                )}
                {on && (
                  <span
                    className={css({
                      position: "absolute",
                      top: "2",
                      right: "2",
                      display: "flex",
                      width: "24px",
                      height: "24px",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "full",
                      bg: "brown.dark",
                      color: "white",
                    })}
                  >
                    <Check size={15} />
                  </span>
                )}
              </div>
              <p
                className={css({
                  marginTop: "2",
                  fontSize: "sm",
                  fontWeight: 500,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                })}
              >
                {item.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* 복사 바 */}
      {selectMode && (
        <div
          className={css({
            position: "fixed",
            bottom: "var(--bottom-nav-height)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "app",
            paddingX: "5",
            paddingY: "3",
            bg: "bg",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: "border",
            zIndex: 20,
          })}
        >
          <Button type="button" fullWidth onClick={copy} disabled={selected.length === 0}>
            <Copy size={18} />
            {selected.length > 0
              ? `${selected.length}개로 AI 추천 프롬프트 복사`
              : "옷을 선택하세요"}
          </Button>
        </div>
      )}
    </>
  );
}
