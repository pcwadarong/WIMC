-- ============================================
-- WIMC Storage RLS 정책
-- 적용: Supabase 대시보드 > SQL Editor 에 실행
-- 버킷은 public(읽기 공개), 쓰기는 인증 유저가 "본인 폴더"에만 가능
-- 경로 규칙: {bucket}/{user_id}/{파일명}
-- ============================================

-- 본인 폴더에 업로드
drop policy if exists "wimc upload own" on storage.objects;
create policy "wimc upload own" on storage.objects for insert to authenticated
with check (
  bucket_id in ('items','outfits','logs','trips','avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 본인 파일 수정
drop policy if exists "wimc update own" on storage.objects;
create policy "wimc update own" on storage.objects for update to authenticated
using (
  bucket_id in ('items','outfits','logs','trips','avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 본인 파일 삭제
drop policy if exists "wimc delete own" on storage.objects;
create policy "wimc delete own" on storage.objects for delete to authenticated
using (
  bucket_id in ('items','outfits','logs','trips','avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 읽기: public 버킷이므로 누구나 조회 허용
drop policy if exists "wimc read public" on storage.objects;
create policy "wimc read public" on storage.objects for select to public
using ( bucket_id in ('items','outfits','logs','trips','avatars') );
