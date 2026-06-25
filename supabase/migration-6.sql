-- ============================================
-- WIMC 마이그레이션 6 — 데일리로그 즉석 조합(item_ids)
-- 적용: Supabase 대시보드 > SQL Editor 에 실행 (1회)
-- 기록을 '저장된 코디' 없이도 옷장에서 옷을 골라(즉석 조합) 남길 수 있게 한다.
-- ============================================
alter table daily_logs add column if not exists item_ids text[] not null default '{}';
