-- ============================================
-- WIMC 마이그레이션 2 — 아이템 상태
-- 적용: Supabase 대시보드 > SQL Editor 에 실행 (1회)
-- ============================================
-- 값: owned(보유중) / wishlist(구매고민) / ordered(배송중) / sold(판매함)
alter table items add column if not exists status text not null default 'owned';
