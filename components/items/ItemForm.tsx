"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { ImageUpload, type EditableImage } from "@/components/items/ImageUpload";
import { SizeInput } from "@/components/items/SizeInput";
import { MaterialInput } from "@/components/items/MaterialInput";
import { createClient } from "@/lib/supabase/client";
import { createItem, updateItem } from "@/app/(app)/closet/actions";
import { SEASON_LABELS, ITEM_STATUS_LABELS } from "@/types";
import type {
  CategoryNode,
  ColorValue,
  Item,
  ItemImage,
  ItemStatus,
  Season,
  SizeInfo,
} from "@/types";
import { fieldStyle } from "@/components/ui/styles";
import { css, cx } from "@/styled-system/css";

const SEASONS = Object.keys(SEASON_LABELS) as Season[];
const STATUSES = Object.keys(ITEM_STATUS_LABELS) as ItemStatus[];

const sectionTitle = css({
  textStyle: "displaySm",
  color: "text.primary",
  marginBottom: "4",
});

const sectionGap = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
});

const select = cx(
  fieldStyle,
  css({ height: "52px", paddingX: "4", appearance: "none", cursor: "pointer" }),
);

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

export function ItemForm({
  categories,
  item,
}: {
  categories: CategoryNode[];
  item?: Item;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const isEdit = Boolean(item);

  const initialParent = item?.category_id
    ? categories.find((c) =>
        c.children.some((ch) => ch.id === item.category_id),
      )
    : undefined;

  const [images, setImages] = useState<EditableImage[]>(() =>
    (item?.images ?? []).map((im, idx) => ({
      id: `ex${idx}`,
      kind: "existing" as const,
      url: im.url,
      bg_removed: im.bg_removed,
    })),
  );
  const [name, setName] = useState(item?.name ?? "");
  const [parentId, setParentId] = useState(initialParent?.id ?? "");
  const [categoryId, setCategoryId] = useState(item?.category_id ?? "");
  const [colors, setColors] = useState<ColorValue[]>(item?.colors ?? []);
  const [material, setMaterial] = useState(item?.material ?? "");
  const [season, setSeason] = useState<Season>(item?.season ?? "all");
  const [status, setStatus] = useState<ItemStatus>(item?.status ?? "owned");
  const [memo, setMemo] = useState(item?.memo ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [purchaseFrom, setPurchaseFrom] = useState(item?.purchase_from ?? "");
  const [purchasePrice, setPurchasePrice] = useState(
    item?.purchase_price != null ? String(item.purchase_price) : "",
  );
  const [purchaseDate, setPurchaseDate] = useState(item?.purchase_date ?? "");
  const [sizeInfo, setSizeInfo] = useState<SizeInfo>(item?.size_info ?? {});

  const [submitting, setSubmitting] = useState(false);

  const parentCategory = useMemo(
    () => categories.find((c) => c.id === parentId),
    [categories, parentId],
  );
  const subCategories = parentCategory?.children ?? [];
  const parentName = parentCategory?.name;

  // 기존 이미지는 URL 유지, 새 이미지는 업로드. 순서대로(첫 번째=대표)
  const buildImages = async (): Promise<ItemImage[]> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const result: ItemImage[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.kind === "existing") {
        result.push({ url: img.url, is_primary: i === 0, bg_removed: img.bg_removed });
        continue;
      }
      const ext = img.file.type.split("/")[1] || "webp";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("items")
        .upload(path, img.file, { contentType: img.file.type });
      if (upErr) throw new Error(`이미지 업로드 실패: ${upErr.message}`);
      const { data: pub } = supabase.storage.from("items").getPublicUrl(path);
      result.push({ url: pub.publicUrl, is_primary: i === 0, bg_removed: false });
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      show("이름을 입력해주세요.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const built = await buildImages();
      const payload = {
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
        size_info: Object.keys(sizeInfo).length > 0 ? sizeInfo : null,
        images: built,
        is_favorite: item?.is_favorite ?? false,
        status,
      };

      const result = item
        ? await updateItem(item.id, payload)
        : await createItem(payload);

      if ("error" in result) {
        show(result.error, "error");
        setSubmitting(false);
        return;
      }
      show(isEdit ? "수정했어요." : "아이템을 저장했어요.", "success");
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      router.push(item ? `/closet/${item.id}` : "/closet");
    } catch (err) {
      show(err instanceof Error ? err.message : "저장에 실패했어요.", "error");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={css({ paddingBottom: "6" })}>
      <Section title="Photos">
        <ImageUpload value={images} onChange={setImages} />
      </Section>

      <Section title="Basic">
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
          <MaterialInput initial={item?.material ?? undefined} onChange={setMaterial} />
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
            className={cx(fieldStyle, css({ padding: "4", resize: "vertical" }))}
          />
        </div>
      </Section>

      <Section title="Size">
        <SizeInput value={sizeInfo} onChange={setSizeInfo} category={parentName} />
      </Section>

      <Section title="Purchase">
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
          ) : isEdit ? (
            "수정 완료"
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </form>
  );
}
