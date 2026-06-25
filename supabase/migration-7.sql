-- ============================================
-- WIMC 마이그레이션 7 — 코디(아웃핏) 즐겨찾기
-- 적용: Supabase 대시보드 > SQL Editor 에 실행 (1회)
-- ============================================
alter table outfits add column if not exists is_favorite boolean not null default false;
