"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ImagePlus, Loader2, X, Save, Shirt, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Thumb } from "@/components/ui/Thumb";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useUnsavedGuard } from "@/hooks/useUnsavedGuard";
import { compressImage } from "@/lib/utils/image";
import { createClient } from "@/lib/supabase/client";
import { upsertLog, deleteLog } from "@/app/(app)/calendar/actions";
import { createOutfit } from "@/app/(app)/outfits/actions";
import { primaryImageUrl } from "@/components/items/ItemCard";
import { fieldStyle } from "@/components/ui/styles";
import type { Item } from "@/types";
import { css, cx } from "@/styled-system/css";

import type { OutfitThumb } from "@/lib/utils/item";
export type { OutfitThumb } from "@/lib/utils/item";

const MAX_PHOTOS = 5;

const label = css({ display: "block", marginBottom: "2", fontSize: "sm", fontWeight: 500, color: "text.secondary" });
const sectionHead = css({ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2" });
const photoGrid = css({ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2" });
const sheetGrid = css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2" });
const check = css({
  position: "absolute",
  top: "1",
  right: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "22px",
  height: "22px",
  borderRadius: "full",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "brown.dark",
  bg: "accent.green",
  color: "brown.dark",
});
const removeBtn = css({
  position: "absolute",
  top: "1",
  right: "1",
  display: "flex",
  width: "22px",
  height: "22px",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "full",
  bg: "overlay",
  color: "white",
  cursor: "pointer",
});
// 점선 "추가/선택" 타일
const addTile = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1",
  aspectRatio: "1",
  borderRadius: "md",
  borderWidth: "1.5px",
  borderStyle: "dashed",
  borderColor: "brown.dark",
  bg: "surface.muted",
  color: "text.tertiary",
  fontSize: "xs",
  cursor: "pointer",
  _disabled: { opacity: 0.5, cursor: "not-allowed" },
});
const pillBtn = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  height: "30px",
  paddingX: "3",
  borderRadius: "full",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "brown.dark",
  bg: "surface",
  fontSize: "xs",
  fontWeight: 600,
  color: "text.primary",
  cursor: "pointer",
});

export function DayLogForm({
  date,
  initialOutfitId,
  initialItemIds,
  initialPhotos,
  initialMemo,
  outfits,
  items,
  pickDate = false,
}: {
  date: string;
  initialOutfitId: string | null;
  initialItemIds: string[];
  initialPhotos: string[];
  initialMemo: string | null;
  outfits: OutfitThumb[];
  items: Item[];
  pickDate?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);

  const [logDate, setLogDate] = useState(date);
  const [outfitId, setOutfitId] = useState<string | null>(initialOutfitId);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialItemIds);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [itemsSheet, setItemsSheet] = useState(false);
  const [outfitSheet, setOutfitSheet] = useState(false);
  const [dirty, setDirty] = useState(false);
  const touch = () => setDirty(true);
  useUnsavedGuard(dirty);
  const isEdit = Boolean(
    initialOutfitId || initialPhotos.length > 0 || initialItemIds.length > 0,
  );

  const itemsById = new Map(items.map((it) => [it.id, it]));
  const chosenOutfit = outfits.find((o) => o.id === outfitId) ?? null;
  const selectedItemObjs = selectedItems
    .map((id) => itemsById.get(id))
    .filter(Boolean) as Item[];

  const toggleItem = (id: string) => {
    touch();
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (photos.length >= MAX_PHOTOS) {
      show(`사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있어요.`, "error");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");
      const compressed = await compressImage(file);
      const path = `${user.id}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage.from("logs").upload(path, compressed, { contentType: "image/webp" });
      if (error) throw new Error(error.message);
      const { data: pub } = supabase.storage.from("logs").getPublicUrl(path);
      setPhotos((prev) => [...prev, pub.publicUrl]);
      touch();
    } catch (e) {
      show(e instanceof Error ? e.message : "업로드 실패", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
    touch();
  };

  const save = async () => {
    const payload = {
      date: logDate,
      outfit_id: outfitId,
      item_ids: selectedItems,
      photos,
      memo: memo.trim() || null,
    };
    if (!payload.outfit_id && payload.photos.length === 0 && payload.item_ids.length === 0) {
      show("사진·옷장 조합·저장된 코디 중 하나는 채워주세요.", "error");
      return;
    }
    setSaving(true);
    const result = await upsertLog(payload);
    if ("error" in result) {
      show(result.error, "error");
      setSaving(false);
      return;
    }
    show("기록했어요.", "success");
    setDirty(false);
    queryClient.invalidateQueries({ queryKey: ["logs"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["items"] });
    router.push("/calendar");
  };

  // 즉석 조합을 코디로도 저장
  const saveAsOutfit = async () => {
    if (selectedItems.length === 0) return;
    setSavingOutfit(true);
    const result = await createOutfit({ name: null, item_ids: selectedItems, tags: [], memo: null });
    setSavingOutfit(false);
    if ("error" in result) {
      show(result.error, "error");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["outfits"] });
    show("코디로 저장했어요.", "success");
  };

  const remove = async () => {
    const ok = await confirm({ title: "이 날의 기록을 삭제할까요?", confirmText: "삭제", danger: true });
    if (!ok) return;
    setSaving(true);
    const result = await deleteLog(date);
    if ("error" in result) {
      show(result.error, "error");
      setSaving(false);
      return;
    }
    show("삭제했어요.", "success");
    queryClient.invalidateQueries({ queryKey: ["logs"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["items"] });
    router.push("/calendar");
  };

  return (
    <div className={css({ paddingX: "5", paddingTop: "4", paddingBottom: "10", display: "flex", flexDirection: "column", gap: "6" })}>
      {pickDate && (
        <div>
          <span className={label}>날짜</span>
          <input
            type="date"
            value={logDate}
            onChange={(e) => { setLogDate(e.target.value); touch(); }}
            className={cx(fieldStyle, css({ height: "48px", paddingX: "3" }))}
          />
        </div>
      )}

      <p className={css({ fontSize: "xs", color: "text.tertiary" })}>
        사진·옷장 조합·저장된 코디를 함께 기록할 수 있어요. (예: 신발만 착샷 + 나머지는 코디)
      </p>

      {/* 사진 (복수, 최대 5) */}
      <div>
        <span className={label}>사진 {photos.length > 0 && `(${photos.length}/${MAX_PHOTOS})`}</span>
        <div className={photoGrid}>
          {photos.map((url) => (
            <Thumb key={url} src={url} radius="md">
              <button type="button" onClick={() => removePhoto(url)} aria-label="사진 제거" className={removeBtn}>
                <X size={13} />
              </button>
            </Thumb>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className={addTile}>
              {uploading ? <Loader2 size={20} className={css({ animation: "spin 1s linear infinite" })} /> : <ImagePlus size={20} />}
              추가
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      </div>

      {/* 옷장에서 조합 — 요약 + 시트 피커 */}
      <div>
        <div className={sectionHead}>
          <span className={css({ fontSize: "sm", fontWeight: 500, color: "text.secondary" })}>
            옷장에서 조합 {selectedItems.length > 0 && `(${selectedItems.length})`}
          </span>
          {selectedItems.length > 0 && (
            <button type="button" onClick={saveAsOutfit} disabled={savingOutfit}
              className={cx(pillBtn, css({ bg: "accent.green" }))}>
              <Save size={13} />
              코디로 저장
            </button>
          )}
        </div>
        {selectedItemObjs.length === 0 ? (
          <button type="button" onClick={() => setItemsSheet(true)}
            className={cx(addTile, css({ flexDirection: "row", aspectRatio: "auto", height: "48px", width: "100%", gap: "2" }))}>
            <Shirt size={18} />
            옷 선택
          </button>
        ) : (
          <button type="button" onClick={() => setItemsSheet(true)}
            className={css({ display: "flex", gap: "2", overflowX: "auto", width: "100%", paddingBottom: "1", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, cursor: "pointer" })}>
            {selectedItemObjs.map((it) => (
              <Thumb key={it.id} src={primaryImageUrl(it)} alt={it.name} radius="sm" outlined iconSize={20}
                className={css({ width: "56px", flexShrink: 0 })} />
            ))}
            <span className={cx(addTile, css({ aspectRatio: "auto", width: "56px", height: "56px", flexShrink: 0, gap: "0.5" }))}>
              편집
            </span>
          </button>
        )}
      </div>

      {/* 저장된 코디 — 요약 + 시트 피커 */}
      <div>
        <span className={label}>저장된 코디</span>
        {chosenOutfit ? (
          <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
            <Thumb src={chosenOutfit.thumb} alt={chosenOutfit.name} radius="sm" outlined iconSize={20}
              className={css({ width: "56px", flexShrink: 0 })} />
            <span className={css({ flex: 1, minWidth: 0, fontSize: "sm", color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
              {chosenOutfit.name}
            </span>
            <button type="button" onClick={() => setOutfitSheet(true)} className={pillBtn}>변경</button>
            <button type="button" onClick={() => { setOutfitId(null); touch(); }} className={cx(pillBtn, css({ borderColor: "border", color: "text.secondary" }))}>해제</button>
          </div>
        ) : outfits.length === 0 ? (
          <p className={css({ fontSize: "sm", color: "text.tertiary" })}>저장된 코디가 없어요. (코디 탭에서 만들 수 있어요)</p>
        ) : (
          <button type="button" onClick={() => setOutfitSheet(true)}
            className={cx(addTile, css({ flexDirection: "row", aspectRatio: "auto", height: "48px", width: "100%", gap: "2" }))}>
            <LayoutGrid size={18} />
            코디 선택
          </button>
        )}
      </div>

      <Textarea
        id="logMemo"
        label="메모"
        value={memo}
        onChange={(e) => { setMemo(e.target.value); touch(); }}
        rows={3}
        placeholder="오늘의 코디 메모 (날씨, 기분, TPO 등)"
      />

      <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
        <Button type="button" fullWidth onClick={save} disabled={saving || uploading}>
          {saving ? <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} /> : "기록 저장"}
        </Button>
        {isEdit && (
          <Button type="button" variant="ghost" fullWidth onClick={remove} disabled={saving}>
            기록 삭제
          </Button>
        )}
      </div>

      {/* 옷 선택 시트 (다중) */}
      <BottomSheet open={itemsSheet} onClose={() => setItemsSheet(false)} title="옷 선택">
        <div className={css({ paddingX: "5", paddingY: "4", overflowY: "auto" })}>
          {items.length === 0 ? (
            <p className={css({ fontSize: "sm", color: "text.tertiary" })}>옷장에 아이템이 없어요.</p>
          ) : (
            <div className={sheetGrid}>
              {items.map((it) => {
                const on = selectedItems.includes(it.id);
                return (
                  <button key={it.id} type="button" onClick={() => toggleItem(it.id)} aria-pressed={on}
                    className={css({ display: "block", width: "100%", cursor: "pointer" })}>
                    <Thumb src={primaryImageUrl(it)} alt={it.name} radius="md" selected={on} outlined>
                      {on && <span className={check}><Check size={13} strokeWidth={3} /></span>}
                    </Thumb>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* 코디 선택 시트 (단일) */}
      <BottomSheet open={outfitSheet} onClose={() => setOutfitSheet(false)} title="코디 선택">
        <div className={css({ paddingX: "5", paddingY: "4", overflowY: "auto" })}>
          <div className={sheetGrid}>
            {outfits.map((o) => {
              const on = outfitId === o.id;
              return (
                <button key={o.id} type="button"
                  onClick={() => { setOutfitId(on ? null : o.id); touch(); setOutfitSheet(false); }}
                  aria-pressed={on}
                  className={css({ display: "block", width: "100%", cursor: "pointer" })}>
                  <Thumb src={o.thumb} alt={o.name} radius="md" selected={on} outlined>
                    {on && <span className={check}><Check size={13} strokeWidth={3} /></span>}
                  </Thumb>
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
