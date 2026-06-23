"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  Pencil,
  ChevronRight,
  Mail,
  Settings,
  Copy,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { cardSurface, fieldStyle } from "@/components/ui/styles";
import { useToast } from "@/components/ui/Toast";
import { ProfilePhotos } from "@/components/profile/ProfilePhotos";
import { updateProfile } from "@/app/(app)/profile/actions";
import { buildStyleAnalysisPrompt } from "@/lib/profile-note";
import { CITY_GROUPS, cityLabel, findCity } from "@/lib/constants/cities";
import type { Profile, ProfilePhotos as Photos, UserLocation } from "@/types";
import { css, cx } from "@/styled-system/css";

const subLabel = css({
  display: "block",
  marginBottom: "2",
  fontSize: "sm",
  fontWeight: 500,
  color: "text.secondary",
});

const selectField = cx(
  fieldStyle,
  css({ height: "48px", paddingX: "3", appearance: "none", cursor: "pointer" }),
);

const STYLE_KEYWORDS = [
  "미니멀",
  "캐주얼",
  "클래식",
  "스트릿",
  "페미닌",
  "모던",
  "빈티지",
  "스포티",
  "러블리",
  "시크",
  "내추럴",
  "프렌치",
];

const card = cx(cardSurface, css({ padding: "5" }));

// 각 행 = 독립된 잉크 아웃라인 카드
const menuRow = (danger = false) =>
  css({
    display: "flex",
    alignItems: "center",
    gap: "3",
    width: "100%",
    padding: "4",
    bg: "surface",
    borderRadius: "md",
    boxShadow: "card",
    fontSize: "base",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    color: danger ? "error" : "text.primary",
    transition: "background 0.12s ease",
    _hover: { bg: "surface.muted" },
  });

// 컬러 아이콘 배지 (bg는 호출부에서 accent.* 지정)
const badge = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "34px",
  height: "34px",
  borderRadius: "sm",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "brown.dark",
  color: "brown.dark",
  flexShrink: 0,
});

export function ProfileForm({ initial }: { initial: Profile | null }) {
  const { show } = useToast();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(initial?.username ?? "");
  const [keywords, setKeywords] = useState<string[]>(initial?.style_keywords ?? []);
  const [analysis, setAnalysis] = useState(initial?.notes ?? "");
  const [location, setLocation] = useState<UserLocation | null>(
    initial?.location ?? null,
  );
  const [photos, setPhotos] = useState<Photos | null>(
    initial?.profile_photos ?? null,
  );
  const [saving, setSaving] = useState(false);

  const toggleKeyword = (k: string) =>
    setKeywords((prev) =>
      prev.includes(k) ? prev.filter((v) => v !== k) : [...prev, k],
    );

  const save = async () => {
    setSaving(true);
    const result = await updateProfile({
      username: username.trim() || null,
      style_keywords: keywords,
      notes: analysis.trim() || null,
      location,
      profile_photos: photos,
    });
    setSaving(false);
    if ("error" in result) {
      show(result.error, "error");
      return;
    }
    show("저장했어요.", "success");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    setEditing(false);
  };

  const cancel = () => {
    setUsername(initial?.username ?? "");
    setKeywords(initial?.style_keywords ?? []);
    setAnalysis(initial?.notes ?? "");
    setLocation(initial?.location ?? null);
    setPhotos(initial?.profile_photos ?? null);
    setEditing(false);
  };

  const copyAnalysisPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildStyleAnalysisPrompt());
      show("프롬프트 복사 완료. 사용하는 AI에 사진과 함께 붙여 대화한 뒤, 최종 분석을 붙여넣으세요.", "success");
    } catch {
      show("복사에 실패했어요.", "error");
    }
  };

  return (
    <div
      className={css({
        paddingBottom: "10",
        display: "flex",
        flexDirection: "column",
        gap: "4",
      })}
    >
      {/* 나의 스타일 */}
      <section className={card}>
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4",
          })}
        >
          <h2 className={css({ textStyle: "displaySm", color: "text.primary" })}>
            My Style
          </h2>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "1",
                fontSize: "sm",
                color: "text.secondary",
                cursor: "pointer",
                _hover: { color: "text.primary" },
              })}
            >
              <Pencil size={14} />
              수정
            </button>
          )}
        </div>

        {editing ? (
          <div className={css({ display: "flex", flexDirection: "column", gap: "5" })}>
            <Input
              id="username"
              label="닉네임"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="표시 이름"
            />

            <div>
              <span className={subLabel}>위치 (날씨 기준)</span>
              <select
                className={selectField}
                value={location?.label ?? ""}
                onChange={(e) => setLocation(findCity(e.target.value))}
              >
                <option value="">현재 위치 (GPS)</option>
                {CITY_GROUPS.map((g) => (
                  <optgroup key={g.region} label={g.region}>
                    {g.cities.map((c) => {
                      const lbl = cityLabel(g.region, c.name);
                      return (
                        <option key={lbl} value={lbl}>
                          {c.name}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <span className={subLabel}>프로필 사진 (AI 참고용)</span>
              <ProfilePhotos value={photos} onChange={setPhotos} />
            </div>

            <div>
              <span className={subLabel}>스타일 키워드</span>
              <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
                {STYLE_KEYWORDS.map((k) => (
                  <Chip
                    key={k}
                    size="sm"
                    active={keywords.includes(k)}
                    onClick={() => toggleKeyword(k)}
                  >
                    {k}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div
                className={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "2",
                })}
              >
                <span className={css({ fontSize: "sm", fontWeight: 500, color: "text.secondary" })}>
                  스타일 분석
                </span>
                <button
                  type="button"
                  onClick={copyAnalysisPrompt}
                  className={css({
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "1",
                    fontSize: "xs",
                    color: "brown.mid",
                    fontWeight: 600,
                    cursor: "pointer",
                  })}
                >
                  <Sparkles size={13} />
                  분석 프롬프트 복사
                  <Copy size={12} />
                </button>
              </div>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                rows={10}
                placeholder="‘분석 프롬프트 복사’를 복사하여 사용하는 AI와 대화한 후 마지막에 정리된 분석을 여기 붙여넣으세요."
                className={cx(
                  fieldStyle,
                  css({ padding: "4", fontSize: "sm", lineHeight: "1.7", resize: "vertical" }),
                )}
              />
            </div>

            <div className={css({ display: "flex", gap: "3" })}>
              <Button type="button" variant="secondary" onClick={cancel} className={css({ flex: 1 })}>
                취소
              </Button>
              <Button type="button" onClick={save} disabled={saving} className={css({ flex: 1 })}>
                {saving ? (
                  <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} />
                ) : (
                  "저장"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "1.5",
                fontSize: "sm",
                color: "text.secondary",
              })}
            >
              <MapPin size={15} className={css({ color: "brown.light" })} />
              {location ? location.label : "현재 위치 (GPS)"}
            </div>

            {(photos?.full || photos?.face) && (
              <div className={css({ display: "flex", gap: "2" })}>
                {[photos.full, photos.face].filter(Boolean).map((u) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={u as string}
                    src={u as string}
                    alt="프로필 사진"
                    className={css({
                      width: "56px",
                      height: "72px",
                      objectFit: "cover",
                      borderRadius: "sm",
                    })}
                  />
                ))}
              </div>
            )}

            {keywords.length > 0 && (
              <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
                {keywords.map((k) => (
                  <span
                    key={k}
                    className={css({
                      height: "30px",
                      paddingX: "3",
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "full",
                      bg: "surface",
                      borderWidth: "1.5px",
                      borderStyle: "solid",
                      borderColor: "brown.dark",
                      fontSize: "sm",
                      fontWeight: 500,
                      color: "text.primary",
                    })}
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}

            {analysis ? (
              <p
                className={css({
                  fontSize: "sm",
                  lineHeight: "1.7",
                  color: "text.secondary",
                  whiteSpace: "pre-wrap",
                })}
              >
                {analysis}
              </p>
            ) : (
              <div
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  gap: "3",
                  alignItems: "flex-start",
                })}
              >
                <p className={css({ fontSize: "sm", color: "text.tertiary" })}>
                  아직 스타일 분석이 없어요. 프롬프트를 복사해 사용하는 AI에 사진과 함께
                  붙여넣고, 받은 분석을 저장해보세요.
                </p>
                <Button type="button" variant="secondary" size="md" onClick={copyAnalysisPrompt}>
                  <Sparkles size={16} />
                  분석 프롬프트 복사
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 메뉴 */}
      <div className={css({ display: "flex", flexDirection: "column", gap: "2.5" })}>
        <Link href="/contact" className={menuRow()}>
          <span className={cx(badge, css({ bg: "accent.green" }))}>
            <Mail size={17} />
          </span>
          <span className={css({ flex: 1 })}>문의</span>
          <ChevronRight size={18} className={css({ color: "text.tertiary" })} />
        </Link>
        <Link href="/settings" className={menuRow()}>
          <span className={cx(badge, css({ bg: "accent.blue" }))}>
            <Settings size={17} />
          </span>
          <span className={css({ flex: 1 })}>설정</span>
          <ChevronRight size={18} className={css({ color: "text.tertiary" })} />
        </Link>
      </div>
    </div>
  );
}
