-- ============================================
-- WIMC Supabase 스키마 (design.md §3)
-- 적용: Supabase 대시보드 > SQL Editor 에 붙여넣고 실행
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (유저 개인 정보 + 스타일 프로필)
-- ============================================
create table if not exists profiles (
  id            uuid references auth.users primary key,
  username      text,
  avatar_url    text,

  skin_tone     text,
  personal_color text,
  body_type     text,
  style_keywords text[],
  preferred_colors text[],
  avoid_colors  text[],
  notes         text,

  size_guide    jsonb,

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================
-- CATEGORIES (카테고리 계층)
-- ============================================
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users not null,
  name        text not null,
  parent_id   uuid references categories(id),
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ============================================
-- ITEMS (옷 아이템)
-- ============================================
create table if not exists items (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users not null,
  category_id   uuid references categories(id),

  name          text not null,
  brand         text,
  purchase_from text,
  purchase_price int,
  purchase_date date,
  memo          text,

  colors        jsonb,
  material      text,
  season        text check (season in ('all', 'summer_winter', 'summer', 'winter')),
  size_info     jsonb,

  is_favorite   boolean default false,
  is_archived   boolean default false,

  images        jsonb,

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================
-- OUTFITS (코디 조합)
-- ============================================
create table if not exists outfits (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users not null,
  name        text,
  memo        text,

  item_ids    uuid[],
  layout      jsonb,

  cover_image text,
  ai_generated boolean default false,
  tags        text[],

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================
-- DAILY_LOGS (착용 캘린더)
-- ============================================
create table if not exists daily_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users not null,
  date        date not null,

  outfit_id   uuid references outfits(id),
  photo_url   text,

  weather     jsonb,
  memo        text,

  created_at  timestamptz default now(),

  unique(user_id, date)
);

-- ============================================
-- TRIPS (여행/이벤트 코디 플래너)
-- ============================================
create table if not exists trips (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users not null,
  name        text not null,
  destination text,
  start_date  date,
  end_date    date,
  cover_image text,
  memo        text,
  created_at  timestamptz default now()
);

create table if not exists trip_days (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid references trips(id) on delete cascade,
  date        date not null,
  outfit_id   uuid references outfits(id),
  weather     jsonb,
  memo        text
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles    enable row level security;
alter table categories  enable row level security;
alter table items       enable row level security;
alter table outfits     enable row level security;
alter table daily_logs  enable row level security;
alter table trips       enable row level security;
alter table trip_days   enable row level security;

-- 본인 데이터만 접근 가능
drop policy if exists "users own data" on profiles;
create policy "users own data" on profiles    for all using (auth.uid() = id);
drop policy if exists "users own data" on categories;
create policy "users own data" on categories  for all using (auth.uid() = user_id);
drop policy if exists "users own data" on items;
create policy "users own data" on items       for all using (auth.uid() = user_id);
drop policy if exists "users own data" on outfits;
create policy "users own data" on outfits     for all using (auth.uid() = user_id);
drop policy if exists "users own data" on daily_logs;
create policy "users own data" on daily_logs  for all using (auth.uid() = user_id);
drop policy if exists "users own data" on trips;
create policy "users own data" on trips       for all using (auth.uid() = user_id);
drop policy if exists "users own trip_days" on trip_days;
create policy "users own trip_days" on trip_days for all using (
  exists (select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid())
);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Supabase 대시보드 > Storage 에서 생성 (모두 private):
--   items / outfits / logs / trips / avatars

-- ============================================
-- UPDATED_AT 자동 갱신 트리거
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists items_updated_at on items;
create trigger items_updated_at    before update on items    for each row execute function update_updated_at();
drop trigger if exists outfits_updated_at on outfits;
create trigger outfits_updated_at  before update on outfits  for each row execute function update_updated_at();
drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();

-- ============================================
-- 신규 유저 가입 시 profiles 자동 생성
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
