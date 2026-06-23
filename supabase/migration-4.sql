-- ============================================
-- WIMC 마이그레이션 4 — 가입 시 입력한 이름(username) 저장
-- 적용: Supabase 대시보드 > SQL Editor 에 실행 (1회)
-- 회원가입 폼의 '이름'은 auth user metadata(username)로 전달됨.
-- 트리거가 이를 읽어 profiles.username 에 넣고, 없으면 이메일 앞부분으로 폴백.
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
