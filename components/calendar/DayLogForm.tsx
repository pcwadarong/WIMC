"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ImagePlus, Loader2, LayoutGrid, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { compressImage } from "@/lib/utils/image";
import { createClient } from "@/lib/supabase/client";
import { upsertLog, deleteLog } from "@/app/(app)/calendar/actions";
import { css } from "@/styled-system/css";

import type { OutfitThumb } from "@/lib/utils/item";
// 타입은 lib/utils/item로 이동 — 기존 import 경로 호환 위해 재노출
export type { OutfitThumb } from "@/lib/utils/item";

export function DayLogForm({
  date,
  initialOutfitId,
  initialPhotoUrl,
  initialMemo,
  outfits,
  pickDate = false,
}: {
  date: string;
  initialOutfitId: string | null;
  initialPhotoUrl: string | null;
  initialMemo: string | null;
  outfits: OutfitThumb[];
  /** true면 날짜 선택 input 노출 (기록 생성 화면용) */
  pickDate?: boolean;
}) {
  const router = useRouter();
  const { show } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [logDate, setLogDate] = useState(date);
  const [outfitId, setOutfitId] = useState<string | null>(initialOutfitId);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initialOutfitId || initialPhotoUrl);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");
      const compressed = await compressImage(file);
      const path = `${user.id}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage
        .from("logs")
        .upload(path, compressed, { contentType: "image/webp" });
      if (error) throw new Error(error.message);
      const { data: pub } = supabase.storage.from("logs").getPublicUrl(path);
      setPhotoUrl(pub.publicUrl);
    } catch (e) {
      show(e instanceof Error ? e.message : "업로드 실패", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const save = async () => {
    if (!outfitId && !photoUrl) {
      show("코디를 선택하거나 사진을 올려주세요.", "error");
      return;
    }
    setSaving(true);
    const result = await upsertLog({
      date: logDate,
      outfit_id: outfitId,
      photo_url: photoUrl,
      memo: memo.trim() || null,
    });
    if ("error" in result) {
      show(result.error, "error");
      setSaving(false);
      return;
    }
    show("기록했어요.", "success");
    router.push("/calendar");
    router.refresh();
  };

  const remove = async () => {
    if (!confirm("이 날의 기록을 삭제할까요?")) return;
    setSaving(true);
    const result = await deleteLog(date);
    if ("error" in result) {
      show(result.error, "error");
      setSaving(false);
      return;
    }
    show("삭제했어요.", "success");
    router.push("/calendar");
    router.refresh();
  };

  return (
    <div className={css({ paddingX: "5", paddingBottom: "10", display: "flex", flexDirection: "column", gap: "6" })}>
      {pickDate && (
        <div>
          <span className={css({ display: "block", marginBottom: "2", fontSize: "sm", fontWeight: 500, color: "text.secondary" })}>
            날짜
          </span>
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className={css({
              width: "100%",
              height: "48px",
              paddingX: "3",
              bg: "surface.muted",
              borderRadius: "sm",
              fontSize: "base",
              color: "text.primary",
              _focusVisible: { outline: "none" },
            })}
          />
        </div>
      )}

      {/* 사진 */}
      <div>
        <span className={css({ display: "block", marginBottom: "2", fontSize: "sm", fontWeight: 500, color: "text.secondary" })}>
          사진
        </span>
        {photoUrl ? (
          <div
            className={css({
              position: "relative",
              aspectRatio: "3/4",
              maxWidth: "240px",
              borderRadius: "md",
              overflow: "hidden",
              bg: "surface.muted",
            })}
          >
            <Image src={photoUrl} alt="오늘 사진" fill sizes="240px" className={css({ objectFit: "cover" })} />
            <button
              type="button"
              onClick={() => setPhotoUrl(null)}
              aria-label="사진 제거"
              className={css({
                position: "absolute",
                top: "1",
                right: "1",
                display: "flex",
                width: "26px",
                height: "26px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "full",
                bg: "overlay",
                color: "white",
                cursor: "pointer",
              })}
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1",
              width: "120px",
              height: "120px",
              borderRadius: "md",
              borderWidth: "1.5px",
              borderStyle: "dashed",
              borderColor: "border",
              bg: "surface.muted",
              color: "text.tertiary",
              cursor: "pointer",
            })}
          >
            {uploading ? (
              <Loader2 size={22} className={css({ animation: "spin 1s linear infinite" })} />
            ) : (
              <ImagePlus size={22} />
            )}
            <span className={css({ fontSize: "xs" })}>사진 추가</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      </div>

      {/* 코디 선택 */}
      <div>
        <span className={css({ display: "block", marginBottom: "2", fontSize: "sm", fontWeight: 500, color: "text.secondary" })}>
          코디 선택
        </span>
        {outfits.length === 0 ? (
          <p className={css({ fontSize: "sm", color: "text.tertiary" })}>
            저장된 코디가 없어요. (코디 탭에서 만들 수 있어요)
          </p>
        ) : (
          <div
            className={css({
              display: "flex",
              gap: "3",
              overflowX: "auto",
              paddingBottom: "2",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            })}
          >
            {outfits.map((o) => {
              const on = outfitId === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOutfitId(on ? null : o.id)}
                  className={css({ flexShrink: 0, width: "84px", cursor: "pointer" })}
                >
                  <div
                    className={css({
                      position: "relative",
                      width: "84px",
                      height: "84px",
                      borderRadius: "md",
                      overflow: "hidden",
                      bg: "surface.muted",
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: on ? "brown.dark" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.tertiary",
                    })}
                  >
                    {o.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.thumb} alt={o.name} className={css({ width: "100%", height: "100%", objectFit: "cover" })} />
                    ) : (
                      <LayoutGrid size={22} />
                    )}
                    {on && (
                      <span
                        className={css({
                          position: "absolute",
                          top: "1",
                          right: "1",
                          display: "flex",
                          width: "20px",
                          height: "20px",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "full",
                          bg: "brown.dark",
                          color: "white",
                        })}
                      >
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <p
                    className={css({
                      marginTop: "1",
                      fontSize: "xs",
                      color: "text.secondary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    })}
                  >
                    {o.name}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 메모 */}
      <div>
        <span className={css({ display: "block", marginBottom: "2", fontSize: "sm", fontWeight: 500, color: "text.secondary" })}>
          메모
        </span>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="오늘의 코디 메모"
          className={css({
            width: "100%",
            padding: "4",
            bg: "surface.muted",
            borderRadius: "sm",
            fontSize: "base",
            color: "text.primary",
            resize: "vertical",
            _placeholder: { color: "text.tertiary" },
            _focusVisible: { outline: "none" },
          })}
        />
      </div>

      <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
        <Button type="button" fullWidth onClick={save} disabled={saving || uploading}>
          {saving ? (
            <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
          ) : (
            "기록 저장"
          )}
        </Button>
        {isEdit && (
          <Button type="button" variant="ghost" fullWidth onClick={remove} disabled={saving}>
            <Trash2 size={18} />
            삭제
          </Button>
        )}
      </div>
    </div>
  );
}
