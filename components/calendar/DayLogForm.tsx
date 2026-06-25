"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Check, ImagePlus, Loader2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useUnsavedGuard } from "@/hooks/useUnsavedGuard";
import { compressImage } from "@/lib/utils/image";
import { createClient } from "@/lib/supabase/client";
import { upsertLog, deleteLog } from "@/app/(app)/calendar/actions";
import { createOutfit } from "@/app/(app)/outfits/actions";
import { primaryImageUrl } from "@/components/items/ItemCard";
import { chipClass } from "@/components/ui/styles";
import { fieldStyle } from "@/components/ui/styles";
import type { Item } from "@/types";
import { css, cx } from "@/styled-system/css";

import type { OutfitThumb } from "@/lib/utils/item";
export type { OutfitThumb } from "@/lib/utils/item";

type Mode = "photo" | "items" | "outfit";

const label = css({ display: "block", marginBottom: "2", fontSize: "sm", fontWeight: 500, color: "text.secondary" });
const pickCell = css({
  position: "relative",
  aspectRatio: "1",
  borderRadius: "md",
  overflow: "hidden",
  bg: "surface.muted",
  boxShadow: "card",
  cursor: "pointer",
});
const pickOn = css({ boxShadow: "0 0 0 2.5px token(colors.brown.dark)" });
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

export function DayLogForm({
  date,
  initialOutfitId,
  initialItemIds,
  initialPhotoUrl,
  initialMemo,
  outfits,
  items,
  pickDate = false,
}: {
  date: string;
  initialOutfitId: string | null;
  initialItemIds: string[];
  initialPhotoUrl: string | null;
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
  const [mode, setMode] = useState<Mode>(
    initialPhotoUrl ? "photo" : initialItemIds.length > 0 ? "items" : "outfit",
  );
  const [outfitId, setOutfitId] = useState<string | null>(initialOutfitId);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialItemIds);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [dirty, setDirty] = useState(false);
  const touch = () => setDirty(true);
  useUnsavedGuard(dirty);
  const isEdit = Boolean(initialOutfitId || initialPhotoUrl || initialItemIds.length > 0);

  const toggleItem = (id: string) => {
    touch();
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
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
      setPhotoUrl(pub.publicUrl);
      touch();
    } catch (e) {
      show(e instanceof Error ? e.message : "업로드 실패", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const save = async () => {
    const payload = {
      date: logDate,
      outfit_id: mode === "outfit" ? outfitId : null,
      item_ids: mode === "items" ? selectedItems : [],
      photo_url: mode === "photo" ? photoUrl : null,
      memo: memo.trim() || null,
    };
    if (!payload.outfit_id && !payload.photo_url && payload.item_ids.length === 0) {
      show("선택한 모드의 내용을 채워주세요.", "error");
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

  const MODES: { key: Mode; label: string }[] = [
    { key: "photo", label: "사진" },
    { key: "items", label: "옷장에서 조합" },
    { key: "outfit", label: "저장된 코디" },
  ];

  return (
    <div className={css({ paddingX: "5", paddingBottom: "10", display: "flex", flexDirection: "column", gap: "6" })}>
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

      {/* 모드 선택 */}
      <div className={css({ display: "flex", gap: "2", flexWrap: "wrap" })}>
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={chipClass({ active: mode === m.key, size: "sm" })}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 모드별 내용 */}
      {mode === "photo" && (
        <div>
          <span className={label}>사진</span>
          {photoUrl ? (
            <div className={css({ position: "relative", aspectRatio: "3/4", maxWidth: "240px", borderRadius: "md", overflow: "hidden", bg: "surface.muted", boxShadow: "card" })}>
              <Image src={photoUrl} alt="오늘 사진" fill sizes="240px" className={css({ objectFit: "cover" })} />
              <button type="button" onClick={() => { setPhotoUrl(null); touch(); }} aria-label="사진 제거"
                className={css({ position: "absolute", top: "1", right: "1", display: "flex", width: "26px", height: "26px", alignItems: "center", justifyContent: "center", borderRadius: "full", bg: "overlay", color: "white", cursor: "pointer" })}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className={css({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1", width: "120px", height: "120px", borderRadius: "md", borderWidth: "1.5px", borderStyle: "dashed", borderColor: "brown.dark", bg: "surface.muted", color: "text.tertiary", cursor: "pointer" })}>
              {uploading ? <Loader2 size={22} className={css({ animation: "spin 1s linear infinite" })} /> : <ImagePlus size={22} />}
              <span className={css({ fontSize: "xs" })}>사진 추가</span>
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
      )}

      {mode === "items" && (
        <div>
          <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2" })}>
            <span className={css({ fontSize: "sm", fontWeight: 500, color: "text.secondary" })}>
              옷장에서 조합 {selectedItems.length > 0 && `(${selectedItems.length})`}
            </span>
            {selectedItems.length > 0 && (
              <button type="button" onClick={saveAsOutfit} disabled={savingOutfit}
                className={css({ display: "inline-flex", alignItems: "center", gap: "1", height: "30px", paddingX: "3", borderRadius: "full", borderWidth: "1.5px", borderStyle: "solid", borderColor: "brown.dark", bg: "accent.green", fontSize: "xs", fontWeight: 600, color: "text.primary", cursor: "pointer" })}>
                <Save size={13} />
                코디로 저장
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className={css({ fontSize: "sm", color: "text.tertiary" })}>옷장에 아이템이 없어요.</p>
          ) : (
            <div className={css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2" })}>
              {items.map((it) => {
                const on = selectedItems.includes(it.id);
                const url = primaryImageUrl(it);
                return (
                  <button key={it.id} type="button" onClick={() => toggleItem(it.id)} aria-pressed={on} className={cx(pickCell, on && pickOn)}>
                    {url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={it.name} className={css({ width: "100%", height: "100%", objectFit: "cover" })} />
                    )}
                    {on && <span className={check}><Check size={13} strokeWidth={3} /></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mode === "outfit" && (
        <div>
          <span className={label}>저장된 코디</span>
          {outfits.length === 0 ? (
            <p className={css({ fontSize: "sm", color: "text.tertiary" })}>저장된 코디가 없어요. (코디 탭에서 만들 수 있어요)</p>
          ) : (
            <div className={css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2" })}>
              {outfits.map((o) => {
                const on = outfitId === o.id;
                return (
                  <button key={o.id} type="button" onClick={() => { setOutfitId(on ? null : o.id); touch(); }} aria-pressed={on} className={cx(pickCell, on && pickOn)}>
                    {o.thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.thumb} alt={o.name} className={css({ width: "100%", height: "100%", objectFit: "cover" })} />
                    )}
                    {on && <span className={check}><Check size={13} strokeWidth={3} /></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}
