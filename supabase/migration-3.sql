-- ============================================
-- WIMC 마이그레이션 3 — 문의(inquiries)
-- 적용: Supabase 대시보드 > SQL Editor 에 실행 (1회)
-- 문의는 이 테이블에 저장되고, 대시보드 Table Editor에서 확인.
-- ============================================
create table if not exists inquiries (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users,
  email      text,
  subject    text,
  message    text not null,
  created_at timestamptz default now()
);

alter table inquiries enable row level security;

-- 인증 유저는 본인 문의 작성 가능
drop policy if exists "insert own inquiry" on inquiries;
create policy "insert own inquiry" on inquiries for insert to authenticated
  with check (auth.uid() = user_id);

-- 본인 문의 조회(선택) — 운영자는 대시보드/Service Role로 전체 확인
drop policy if exists "read own inquiry" on inquiries;
create policy "read own inquiry" on inquiries for select to authenticated
  using (auth.uid() = user_id);
