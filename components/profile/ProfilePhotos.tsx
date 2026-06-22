"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/utils/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { ProfilePhotos as Photos } from "@/types";
import { css } from "@/styled-system/css";

type Slot = "full" | "face";
const SLOTS: { key: Slot; label: string }[] = [
  { key: "full", label: "전신" },
  { key: "face", label: "얼굴" },
];

export function ProfilePhotos({
  value,
  onChange,
}: {
  value: Photos | null;
  onChange: (v: Photos) => void;
}) {
  const { show } = useToast();
  const current: Photos = value ?? {};

  return (
    <div className={css({ display: "flex", gap: "3" })}>
      {SLOTS.map((slot) => (
        <Slot
          key={slot.key}
          label={slot.label}
          url={current[slot.key] ?? null}
          onUploaded={(url) => onChange({ ...current, [slot.key]: url })}
          onRemove={() => onChange({ ...current, [slot.key]: null })}
          onError={(m) => show(m, "error")}
        />
      ))}
    </div>
  );
}

function Slot({
  label,
  url,
  onUploaded,
  onRemove,
  onError,
}: {
  label: string;
  url: string | null;
  onUploaded: (url: string) => void;
  onRemove: () => void;
  onError: (m: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");
      const compressed = await compressImage(file);
      const path = `${user.id}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { contentType: "image/webp" });
      if (error) throw new Error(error.message);
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      onUploaded(pub.publicUrl);
    } catch (e) {
      onError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={css({ flex: 1 })}>
      <div
        className={css({
          position: "relative",
          aspectRatio: "3/4",
          borderRadius: "md",
          overflow: "hidden",
          bg: "surface.muted",
          borderWidth: "1.5px",
          borderStyle: url ? "solid" : "dashed",
          borderColor: "border",
        })}
      >
        {url ? (
          <>
            <Image src={url} alt={label} fill sizes="50vw" className={css({ objectFit: "cover" })} />
            <button
              type="button"
              onClick={onRemove}
              aria-label={`${label} 삭제`}
              className={css({
                position: "absolute",
                top: "1",
                right: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "26px",
                height: "26px",
                borderRadius: "full",
                bg: "overlay",
                color: "white",
                cursor: "pointer",
              })}
            >
              <X size={15} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1",
              width: "100%",
              height: "100%",
              color: "text.tertiary",
              cursor: "pointer",
              _hover: { color: "text.secondary" },
            })}
          >
            {busy ? (
              <Loader2 size={22} className={css({ animation: "spin 1s linear infinite" })} />
            ) : (
              <ImagePlus size={22} />
            )}
            <span className={css({ fontSize: "sm" })}>{label}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
