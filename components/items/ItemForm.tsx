"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { ImageUpload, type LocalImage } from "@/components/items/ImageUpload";
import { SizeInput } from "@/components/items/SizeInput";
import { MaterialInput } from "@/components/items/MaterialInput";
import { createClient } from "@/lib/supabase/client";
import { createItem } from "@/app/(app)/closet/actions";
import { SEASON_LABELS, ITEM_STATUS_LABELS } from "@/types";
import type {
  CategoryNode,
  ColorValue,
  ItemImage,
  ItemStatus,
  Season,
  SizeInfo,
} from "@/types";
import { css } from "@/styled-system/css";

const SEASONS = Object.keys(SEASON_LABELS) as Season[];
const STATUSES = Object.keys(ITEM_STATUS_LABELS) as ItemStatus[];

const sectionTitle = css({
  textStyle: "lg",
  fontWeight: 700,
  color: "text.primary",
  marginBottom: "4",
});

const sectionGap = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
});

const select = css({
  width: "100%",
  height: "52px",
  paddingX: "4",
  bg: "surface.muted",
  borderRadius: "sm",
  fontSize: "base",
  color: "text.primary",
  appearance: "none",
  cursor: "pointer",
  _focusVisible: { outline: "none" },
});

const fieldLabel = css({
  display: "block",
  marginBottom: "2",
  fontSize: "sm",
  fontWeight: 500,
  color: "text.secondary",
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={css({
        marginTop: "10",
        bg: "surface",
        borderRadius: "md",
        boxShadow: "card",
        padding: "5",
      })}
    >
      <h2 className={sectionTitle}>{title}</h2>
      <div className={sectionGap}>{children}</div>
    </section>
  );
}

export function ItemForm({ categories }: { categories: CategoryNode[] }) {
  const router = useRouter();
  const { show } = useToast();

  const [images, setImages] = useState<LocalImage[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [colors, setColors] = useState<ColorValue[]>([]);
  const [material, setMaterial] = useState("");
  const [season, setSeason] = useState<Season>("all");
  const [status, setStatus] = useState<ItemStatus>("owned");
  const [memo, setMemo] = useState("");
  const [brand, setBrand] = useState("");
  const [purchaseFrom, setPurchaseFrom] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [sizeInfo, setSizeInfo] = useState<SizeInfo>({});

  const [submitting, setSubmitting] = useState(false);

  const parentCategory = useMemo(
    () => categories.find((c) => c.id === parentId),
    [categories, parentId],
  );
  const subCategories = parentCategory?.children ?? [];
  const parentName = parentCategory?.name;

  const uploadImages = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const uploaded: ItemImage[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const ext = img.file.type.split("/")[1] || "webp";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("items")
        .upload(path, img.file, { contentType: img.file.type });
      if (upErr) throw new Error(`이미지 업로드 실패: ${upErr.message}`);
      const { data: pub } = supabase.storage.from("items").getPublicUrl(path);
      uploaded.push({ url: pub.publicUrl, is_primary: i === 0, bg_removed: false });
    }
    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      show("이름을 입력해주세요.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const uploadedImages = await uploadImages();
      const result = await createItem({
        name,
        category_id: categoryId || null,
        brand: brand.trim() || null,
        purchase_from: purchaseFrom.trim() || null,
        purchase_price: purchasePrice ? Number(purchasePrice) : null,
        purchase_date: purchaseDate || null,
        memo: memo.trim() || null,
        material: material.trim() || null,
        season,
        colors,
        size_info:
          Object.keys(sizeInfo).length > 0 ? sizeInfo : null,
        images: uploadedImages,
        is_favorite: false,
        status,
      });

      if ("error" in result) {
        show(result.error, "error");
        setSubmitting(false);
        return;
      }
      show("아이템을 저장했어요.", "success");
      router.push("/closet");
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : "저장에 실패했어요.", "error");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={css({ paddingBottom: "6" })}>
      <Section title="사진">
        <ImageUpload value={images} onChange={setImages} />
      </Section>

      <Section title="기본 정보">
        <Input
          id="name"
          label="이름 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 오버핏 코튼 셔츠"
          required
        />

        <div>
          <span className={fieldLabel}>카테고리</span>
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2",
            })}
          >
            <select
              className={select}
              aria-label="대분류"
              value={parentId}
              onChange={(e) => {
                setParentId(e.target.value);
                setCategoryId("");
              }}
            >
              <option value="">대분류</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className={select}
              aria-label="소분류"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!parentId}
            >
              <option value="">소분류</option>
              {subCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className={fieldLabel}>색상</span>
          <ColorPicker value={colors} onChange={setColors} />
        </div>

        <div>
          <span className={fieldLabel}>소재</span>
          <MaterialInput onChange={setMaterial} />
        </div>

        <div>
          <span className={fieldLabel}>시즌</span>
          <div
            role="radiogroup"
            className={css({ display: "flex", gap: "2", flexWrap: "wrap" })}
          >
            {SEASONS.map((s) => (
              <Chip
                key={s}
                role="radio"
                aria-checked={season === s}
                active={season === s}
                onClick={() => setSeason(s)}
              >
                {SEASON_LABELS[s]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className={fieldLabel}>상태</span>
          <div className={css({ display: "flex", gap: "2", flexWrap: "wrap" })}>
            {STATUSES.map((s) => (
              <Chip
                key={s}
                active={status === s}
                onClick={() => setStatus(s)}
              >
                {ITEM_STATUS_LABELS[s]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className={fieldLabel}>메모</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="자유 메모"
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
      </Section>

      <Section title="사이즈">
        <SizeInput value={sizeInfo} onChange={setSizeInfo} category={parentName} />
      </Section>

      <Section title="구매 정보">
        <Input
          id="brand"
          label="브랜드"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <Input
          id="purchaseFrom"
          label="구매처"
          value={purchaseFrom}
          onChange={(e) => setPurchaseFrom(e.target.value)}
          placeholder="예: 무신사"
        />
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2",
          })}
        >
          <Input
            id="purchasePrice"
            label="구매가격 (원)"
            type="number"
            inputMode="numeric"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
          <Input
            id="purchaseDate"
            label="구매날짜"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>
      </Section>

      <div className={css({ marginTop: "6" })}>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? (
            <>
              <Loader2
                size={18}
                className={css({ animation: "spin 1s linear infinite" })}
              />
              저장 중…
            </>
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </form>
  );
}
