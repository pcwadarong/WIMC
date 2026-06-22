"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, Star, ImagePlus, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/utils/image";
import { css } from "@/styled-system/css";

/** 기존(업로드됨) 이미지와 새로 고른 파일을 한 목록으로 관리 */
export type EditableImage =
  | { id: string; kind: "existing"; url: string; bg_removed: boolean }
  | { id: string; kind: "new"; file: File; previewUrl: string };

interface ImageUploadProps {
  value: EditableImage[];
  onChange: (images: EditableImage[]) => void;
  max?: number;
}

const srcOf = (img: EditableImage) =>
  img.kind === "existing" ? img.url : img.previewUrl;

export function ImageUpload({ value, onChange, max = 5 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    const remaining = max - value.length;
    const picked = Array.from(files).slice(0, remaining);

    const added: EditableImage[] = [];
    for (const file of picked) {
      const compressed = await compressImage(file);
      added.push({
        id: crypto.randomUUID(),
        kind: "new",
        file: compressed,
        previewUrl: URL.createObjectURL(compressed),
      });
    }
    onChange([...value, ...added]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (id: string) => {
    const target = value.find((v) => v.id === id);
    if (target?.kind === "new") URL.revokeObjectURL(target.previewUrl);
    onChange(value.filter((v) => v.id !== id));
  };

  const makePrimary = (id: string) => {
    const target = value.find((v) => v.id === id);
    if (!target) return;
    onChange([target, ...value.filter((v) => v.id !== id)]);
  };

  return (
    <div>
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2",
        })}
      >
        {value.map((img, i) => (
          <div
            key={img.id}
            className={css({
              position: "relative",
              aspectRatio: "1",
              borderRadius: "md",
              overflow: "hidden",
              bg: "surface.muted",
            })}
          >
            <Image
              src={srcOf(img)}
              alt=""
              fill
              sizes="33vw"
              className={css({ objectFit: "cover" })}
              unoptimized
            />
            {i === 0 && (
              <span
                className={css({
                  position: "absolute",
                  top: "1",
                  left: "1",
                  paddingX: "2",
                  paddingY: "0.5",
                  borderRadius: "full",
                  bg: "brown.dark",
                  color: "white",
                  fontSize: "xs",
                  fontWeight: 600,
                })}
              >
                대표
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(img.id)}
              aria-label="사진 삭제"
              className={css({
                position: "absolute",
                top: "1",
                right: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "full",
                bg: "overlay",
                color: "white",
                cursor: "pointer",
              })}
            >
              <X size={14} />
            </button>
            {i !== 0 && (
              <button
                type="button"
                onClick={() => makePrimary(img.id)}
                aria-label="대표 사진으로"
                className={css({
                  position: "absolute",
                  bottom: "1",
                  left: "1",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "1",
                  paddingX: "2",
                  height: "22px",
                  borderRadius: "full",
                  bg: "overlay",
                  color: "white",
                  fontSize: "xs",
                  cursor: "pointer",
                })}
              >
                <Star size={12} />
                대표
              </button>
            )}
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            aria-label="사진 추가"
            className={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1",
              aspectRatio: "1",
              borderRadius: "md",
              borderWidth: "1.5px",
              borderStyle: "dashed",
              borderColor: "border",
              bg: "surface.muted",
              color: "text.tertiary",
              cursor: "pointer",
              _hover: { borderColor: "brown.light", color: "text.secondary" },
            })}
          >
            {busy ? (
              <Loader2
                size={22}
                className={css({ animation: "spin 1s linear infinite" })}
              />
            ) : (
              <ImagePlus size={22} />
            )}
            <span className={css({ fontSize: "xs" })}>
              {value.length}/{max}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
