-- ============================================
-- WIMC 마이그레이션 8 — 착용 기록 사진 복수화
-- daily_logs.photo_url(단일) → photos(배열, jsonb)
-- 적용: Supabase 대시보드 > SQL Editor 에 실행 (1회)
-- ============================================

-- 1) 사진 배열 컬럼 추가 (기본 빈 배열)
alter table daily_logs
  add column if not exists photos jsonb not null default '[]'::jsonb;

-- 2) 기존 단일 photo_url 값을 배열로 백필
update daily_logs
  set photos = jsonb_build_array(photo_url)
  where photo_url is not null
    and photos = '[]'::jsonb;

-- 3) 더 이상 쓰지 않는 단일 컬럼 제거
alter table daily_logs
  drop column if exists photo_url;
