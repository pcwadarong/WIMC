"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Loader2, Shirt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { primaryImageUrl } from "@/components/items/ItemCard";
import { createOutfit } from "@/app/(app)/outfits/actions";
import type { CategoryMap } from "@/lib/recommend";
import type { Item } from "@/types";
import { chipClass } from "@/components/ui/styles";
import { css } from "@/styled-system/css";

export function OutfitBuilder({
  items,
  categoryMap,
  parents,
}: {
  items: Item[];
  categoryMap: CategoryMap;
  parents: string[];
}) {
  const router = useRouter();
  const { show } = useToast();

  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!cat) return items;
    return items.filter(
      (i) => i.category_id && categoryMap[i.category_id]?.parentName === cat,
    );
  }, [items, cat, categoryMap]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const save = async () => {
    if (selected.length === 0) {
      show("아이템을 1개 이상 선택해주세요.", "error");
      return;
    }
    setSaving(true);
    const result = await createOutfit({
      name: name.trim() || null,
      item_ids: selected,
      tags: [],
      memo: null,
    });
    if ("error" in result) {
      show(result.error, "error");
      setSaving(false);
      return;
    }
    show("코디를 저장했어요.", "success");
    router.push("/outfits");
    router.refresh();
  };

  const tab = (active: boolean) =>
    chipClass({ active, variant: "fill", size: "sm" });

  return (
    <div className={css({ paddingBottom: "32" })}>
      <div className={css({ paddingX: "5", paddingTop: "4" })}>
        <Input
          id="outfitName"
          label="코디 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 비 오는 날 캠퍼스룩"
        />
      </div>

      {/* 카테고리 필터 */}
      <div
        className={css({
          display: "flex",
          gap: "2",
          overflowX: "auto",
          paddingX: "5",
          paddingY: "4",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        })}
      >
        <button type="button" className={tab(!cat)} onClick={() => setCat("")}>
          전체
        </button>
        {parents.map((p) => (
          <button
            key={p}
            type="button"
            className={tab(cat === p)}
            onClick={() => setCat(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 아이템 그리드 */}
      {filtered.length === 0 ? (
        <p
          className={css({
            paddingX: "5",
            paddingY: "8",
            textAlign: "center",
            fontSize: "sm",
            color: "text.tertiary",
          })}
        >
          이 카테고리에 아이템이 없어요.
        </p>
      ) : (
        <div
          className={css({
            paddingX: "5",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "3",
          })}
        >
          {filtered.map((item) => {
            const url = primaryImageUrl(item);
            const on = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={css({
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "md",
                  overflow: "hidden",
                  bg: "surface.muted",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderColor: on ? "brown.dark" : "transparent",
                  cursor: "pointer",
                })}
              >
                {url ? (
                  <Image src={url} alt={item.name} fill sizes="33vw" className={css({ objectFit: "cover" })} />
                ) : (
                  <span
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "text.tertiary",
                    })}
                  >
                    <Shirt size={24} />
                  </span>
                )}
                {on && (
                  <span
                    className={css({
                      position: "absolute",
                      top: "1",
                      right: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "22px",
                      height: "22px",
                      borderRadius: "full",
                      bg: "brown.dark",
                      color: "white",
                    })}
                  >
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 저장 바 (고정) */}
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
        <Button type="button" fullWidth onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
          ) : (
            `코디 저장 (${selected.length})`
          )}
        </Button>
      </div>
    </div>
  );
}
