-- ============================================
-- WIMC 마이그레이션 1 — 프로필 사진 + 위치
-- 적용: Supabase 대시보드 > SQL Editor 에 실행 (1회)
-- ============================================

-- 위치(추천 날씨용): { "label": "서울", "lat": 37.5665, "lon": 126.978 }
alter table profiles add column if not exists location jsonb;

-- AI 참고용 프로필 사진: { "full": "url", "face": "url" }
alter table profiles add column if not exists profile_photos jsonb;
