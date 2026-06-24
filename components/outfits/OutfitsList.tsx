"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { useOutfits, useItems } from "@/lib/queries/hooks";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { bulkDeleteOutfits } from "@/app/(app)/outfits/actions";
import { indexById } from "@/lib/utils/item";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { Fab } from "@/components/ui/Fab";
import { css } from "@/styled-system/css";

type OutfitSort = "recent" | "oldest" | "name";
const SORTS: { key: OutfitSort; label: string }[] = [
  { key: "recent", label: "최근순" },
  { key: "oldest", label: "오래된순" },
  { key: "name", label: "이름순" },
];

const linkBtn = css({ fontSize: "sm", color: "text.secondary", fontWeight: 600, cursor: "pointer" });

export function OutfitsList() {
  const { data: outfits = [], isLoading } = useOutfits();
  const { data: items = [] } = useItems();
  const itemsById = useMemo(() => indexById(items), [items]);
  const [sort, setSort] = useState<OutfitSort>("recent");

  const queryClient = useQueryClient();
  const { show } = useToast();
  const confirm = useConfirm();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...outfits];
    if (sort === "oldest") return arr.reverse();
    if (sort === "name")
      return arr.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ko"));
    return arr;
  }, [outfits, sort]);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const exitSelect = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };
  const allSelected = sorted.length > 0 && sorted.every((o) => selectedIds.has(o.id));
  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(sorted.map((o) => o.id)));

  const onDelete = async () => {
    if (selectedIds.size === 0 || busy) return;
    const ok = await confirm({
      title: `선택한 ${selectedIds.size}개 코디를 삭제할까요?`,
      message: "삭제하면 되돌릴 수 없어요.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    const result = await bulkDeleteOutfits([...selectedIds]);
    setBusy(false);
    if ("error" in result) {
      show(result.error, "error");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["outfits"] });
    show("삭제했어요.", "success");
    exitSelect();
  };

  if (isLoading) return <GridSkeleton />;

  if (outfits.length === 0) {
    return (
      <p className={css({ marginTop: "12", textAlign: "center", color: "text.tertiary", fontSize: "sm" })}>
        아직 만든 코디가 없어요. + 버튼으로 옷을 조합해보세요.
      </p>
    );
  }

  return (
    <>
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "3",
        })}
      >
        {selectMode ? (
          <>
            <button type="button" onClick={toggleAll} className={css({ fontSize: "sm", color: "text.secondary", fontWeight: 500, cursor: "pointer" })}>
              {allSelected ? "선택 해제" : "전체 선택"}
            </button>
            <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
              <span className={css({ fontSize: "sm", color: "text.secondary" })}>{selectedIds.size}개</span>
              <button type="button" onClick={exitSelect} className={linkBtn}>취소</button>
            </div>
          </>
        ) : (
          <>
            <span className={css({ fontSize: "sm", color: "text.tertiary" })}>{sorted.length}개</span>
            <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
              <button type="button" onClick={() => setSelectMode(true)} className={linkBtn}>선택</button>
              <select
                aria-label="정렬"
                value={sort}
                onChange={(e) => setSort(e.target.value as OutfitSort)}
                className={css({
                  height: "32px",
                  paddingX: "2",
                  bg: "transparent",
                  fontSize: "sm",
                  color: "text.secondary",
                  cursor: "pointer",
                  _focusVisible: { outline: "none" },
                })}
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "5",
          rowGap: "6",
        })}
      >
        {sorted.map((o) => (
          <OutfitCard
            key={o.id}
            outfit={o}
            itemsById={itemsById}
            selectionMode={selectMode}
            selected={selectedIds.has(o.id)}
            onSelect={toggleSelect}
          />
        ))}
      </div>

      {selectMode && (
        <div
          className={css({
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "calc(env(safe-area-inset-bottom) + 88px)",
            zIndex: 45,
            width: "calc(min(100vw, token(sizes.app)) - 28px)",
            display: "flex",
            padding: "2",
            bg: "surface",
            borderRadius: "full",
            boxShadow: "0 0 0 1.5px token(colors.brown.dark), 0 10px 28px rgba(0, 0, 0, 0.14)",
          })}
        >
          <button
            type="button"
            onClick={onDelete}
            disabled={selectedIds.size === 0 || busy}
            className={css({
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5",
              flex: 1,
              height: "42px",
              borderRadius: "full",
              borderWidth: "1.5px",
              borderStyle: "solid",
              borderColor: "error",
              color: "error",
              fontSize: "sm",
              fontWeight: 600,
              cursor: "pointer",
              _disabled: { opacity: 0.4, cursor: "not-allowed" },
            })}
          >
            <Trash2 size={16} />
            삭제
          </button>
        </div>
      )}

      {!selectMode && <Fab href="/outfits/new" label="코디 만들기" />}
    </>
  );
}
