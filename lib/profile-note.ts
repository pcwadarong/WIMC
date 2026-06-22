import type { Profile } from "@/types";
import { STYLE_ANALYSIS_PROMPT } from "@/lib/prompts/style-analysis";

/** 프로필 → AI 추천 프롬프트의 '내 스타일' 컨텍스트. 상세 분석(notes) 우선 */
export function buildProfileNote(profile: Profile | null): string | undefined {
  if (!profile) return undefined;
  const parts: string[] = [];
  if (profile.notes) parts.push(profile.notes);
  if (profile.style_keywords?.length)
    parts.push(`선호 스타일 키워드: ${profile.style_keywords.join(", ")}`);
  return parts.length ? parts.join("\n") : undefined;
}

/**
 * AI 스타일 분석 프롬프트. 본문은 lib/prompts/style-analysis.ts 에서 관리한다.
 * (그 파일을 열어 텍스트만 수정하면 됨)
 */
export function buildStyleAnalysisPrompt(): string {
  return STYLE_ANALYSIS_PROMPT;
}
