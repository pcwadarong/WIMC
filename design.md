# 나만의 옷장 앱 — 전체 설계 문서
> Claude Code에 붙여넣기용 마스터 스펙

---

## 1. 프로젝트 개요

**앱 이름 (가칭):** `WIMC` (나중에 바꿔도 됨)  
**목적:** 개인 옷장 관리 + 코디 기록 + AI 스타일 추천  
**타겟 디바이스:** 모바일 퍼스트 (iPhone), 나중에 데스크탑 확장  
**사용자:** 1~3명 (Supabase Auth로 유저별 데이터 격리)  
**기술 스택:**
- Frontend: Next.js 14 (App Router) + TypeScript
- Styling: Pandas CSS + CSS Variables (디자인 토큰)
- Backend/DB: Supabase (PostgreSQL + Storage + Auth + RLS)
- 이미지 처리: browser-image-compression (업로드 전 클라이언트 압축)
- 배경 제거: remove.bg API (선택적, 월 50장 무료)
- AI 코디 추천: Anthropic Claude API (claude-sonnet-4-6)
- 날씨: Open-Meteo API (무료, 위치 기반)
- 배포: Vercel

---

## 2. 디자인 토큰

### 색상
```css
:root {
  /* Primary */
  --color-brown-dark:   #2C1A0E;  /* 키컬러, 주요 텍스트, 버튼 */
  --color-brown-mid:    #6B3F2A;  /* 보조 액센트, 호버 */
  --color-brown-light:  #C4956A;  /* 서브 액센트, 아이콘 */

  /* Background */
  --color-bg:           #FAFAF8;  /* 전체 배경 (거의 흰색, 살짝 베이지) */
  --color-surface:      #FFFFFF;  /* 카드, 모달 배경 */
  --color-surface-2:    #F4F2EE;  /* 필터칩, 인풋 배경 */

  /* Text */
  --color-text-primary:   #1A1208;  /* 제목, 강조 */
  --color-text-secondary: #6B6560;  /* 설명, 부제 */
  --color-text-tertiary:  #B0ABA6;  /* 플레이스홀더, 비활성 */

  /* Border */
  --color-border:       #E8E4DE;
  --color-border-focus: #2C1A0E;

  /* Semantic */
  --color-error:        #C0392B;
  --color-success:      #27AE60;
}
```

### 타이포그래피
```css
/* 폰트: Pretendard (device font 우선) */
font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont,
             'Apple SD Gothic Neo', sans-serif;

/* 스케일 */
--text-xs:   11px / line-height: 1.6 / letter-spacing: -0.02em
--text-sm:   13px / line-height: 1.6 / letter-spacing: -0.02em
--text-base: 15px / line-height: 1.7 / letter-spacing: -0.025em
--text-lg:   17px / line-height: 1.6 / letter-spacing: -0.03em
--text-xl:   20px / line-height: 1.4 / letter-spacing: -0.03em
--text-2xl:  24px / line-height: 1.3 / letter-spacing: -0.035em
--text-3xl:  30px / line-height: 1.2 / letter-spacing: -0.04em

/* 원칙: 자간 좁게(-0.02 ~ -0.04em), 행간 넓게(1.6~1.7), 폰트 작게 */
```

### 스페이싱
```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px

/* 컴포넌트 간 간격: 최소 --space-6 (24px) */
/* 섹션 간 간격: --space-10 ~ --space-12 */
/* 좌우 페이지 패딩: 20px */
```

### 반경 & 그림자
```css
--radius-sm:  8px   /* 인풋, 필터칩 */
--radius-md:  12px  /* 카드, 이미지 */
--radius-lg:  16px  /* 바텀시트, 모달 */
--radius-full: 9999px /* 버튼, 배지 */

--shadow-card: 0 1px 3px rgba(44, 26, 14, 0.06), 0 1px 2px rgba(44, 26, 14, 0.04);
--shadow-modal: 0 20px 60px rgba(44, 26, 14, 0.15);
```

---

## 3. Supabase 스키마 (SQL)

```sql
-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (유저 개인 정보 + 스타일 프로필)
-- ============================================
create table profiles (
  id            uuid references auth.users primary key,
  username      text,
  avatar_url    text,

  -- 신체/스타일 정보
  skin_tone     text,          -- 웜/쿨/뉴트럴
  personal_color text,         -- 봄웜/여름쿨/가을웜/겨울쿨
  body_type     text,
  style_keywords text[],       -- ['미니멀', '캐주얼', '모던']
  preferred_colors text[],     -- 좋아하는 컬러 hex 배열
  avoid_colors  text[],
  notes         text,          -- 자유 메모

  -- 나의 사이즈 기준 (대표 사이즈 정보)
  size_guide    jsonb,
  /* 예시:
  {
    "top": { "label": "M", "chest": 96, "shoulder": 42 },
    "bottom": { "label": "26", "waist": 68, "hip": 94, "thigh": 54, "hem": 36, "rise": 28 },
    "shoes": { "label": "245", "us": "7.5", "uk": "5", "eu": "38" },
    "preferred_fit": "약간 루즈"
  }
  */

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================
-- CATEGORIES (카테고리 계층)
-- ============================================
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users not null,
  name        text not null,
  parent_id   uuid references categories(id),
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- 기본 카테고리 (트리거나 앱 초기화 시 삽입)
-- 대분류: 상의, 하의, 아우터, 신발, 가방, 악세서리
-- 소분류 예시:
--   상의 > 티셔츠, 블라우스, 니트, 셔츠, 맨투맨, 후드
--   하의 > 팬츠, 숏팬츠, 데님, 카고, 스커트, 레깅스
--   아우터 > 코트, 재킷, 패딩, 가디건, 바람막이
--   신발 > 스니커즈, 로퍼, 부츠, 샌들, 힐
--   가방 > 숄더백, 크로스백, 에코백, 클러치, 백팩
--   악세서리 > 목걸이, 귀걸이, 반지, 벨트, 모자, 스카프

-- ============================================
-- ITEMS (옷 아이템)
-- ============================================
create table items (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users not null,
  category_id   uuid references categories(id),

  -- 기본 정보
  name          text not null,
  brand         text,
  purchase_from text,          -- 구매처 (무신사, 지그재그, 해외직구 등)
  purchase_price int,          -- 원화 기준
  purchase_date date,
  memo          text,

  -- 색상 (복수 가능 — 멜란지, 패턴 등)
  colors        jsonb,
  /* 예시:
  [
    { "label": "버터", "hex": "#F5E6C8" },
    { "label": "연청", "hex": "#A8C4D8" }
  ]
  */

  -- 소재
  material      text,

  -- 시즌
  season        text check (season in ('all', 'summer_winter', 'summer', 'winter')),

  -- 사이즈
  size_info     jsonb,
  /* 예시:
  {
    "label": "M",
    "numeric": "26",
    "us": "4",
    "uk": "8",
    "jp": "38",
    "measurements": {
      "chest": 100,
      "shoulder": 43,
      "length": 58,
      "waist": 72,
      "hip": 96,
      "thigh": 56,
      "hem": 38,
      "rise": 27,
      "inseam": 72
    }
  }
  */

  -- 상태
  is_favorite   boolean default false,
  is_archived   boolean default false,  -- 더 이상 안 입는 옷

  -- 이미지 (Supabase Storage URL 배열, 최대 5개)
  images        jsonb,
  /* 예시:
  [
    { "url": "https://...", "is_primary": true, "bg_removed": false },
    { "url": "https://...", "is_primary": false, "bg_removed": true }
  ]
  */

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================
-- OUTFITS (코디 조합)
-- ============================================
create table outfits (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users not null,
  name        text,
  memo        text,

  -- 코디 구성 아이템 목록
  item_ids    uuid[],

  -- 코디 레이아웃 (6x4 그리드 배치 정보)
  layout      jsonb,
  /* 예시:
  [
    { "item_id": "uuid", "x": 0, "y": 0, "w": 3, "h": 4 },
    { "item_id": "uuid", "x": 3, "y": 0, "w": 3, "h": 4 }
  ]
  */

  -- 코디 완성 이미지 (레이아웃 렌더링 후 캡처 or 직접 업로드)
  cover_image text,

  -- AI 생성 여부
  ai_generated boolean default false,

  -- 태그
  tags        text[],

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================
-- DAILY_LOGS (착용 캘린더)
-- ============================================
create table daily_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users not null,
  date        date not null,

  -- 코디 (outfit 연결 or 직접 사진)
  outfit_id   uuid references outfits(id),
  photo_url   text,            -- 직접 찍은 사진 (outfit 없이도 가능)

  -- 날씨 (자동 저장)
  weather     jsonb,
  /* 예시:
  { "temp_min": 8, "temp_max": 18, "condition": "맑음", "location": "서울" }
  */

  memo        text,

  created_at  timestamptz default now(),

  unique(user_id, date)
);

-- ============================================
-- TRIPS (여행/이벤트 코디 플래너)
-- ============================================
create table trips (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users not null,
  name        text not null,   -- "도쿄 여행", "제주 워케이션"
  destination text,
  start_date  date,
  end_date    date,
  cover_image text,
  memo        text,
  created_at  timestamptz default now()
);

create table trip_days (
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
create policy "users own data" on profiles    for all using (auth.uid() = id);
create policy "users own data" on categories  for all using (auth.uid() = user_id);
create policy "users own data" on items       for all using (auth.uid() = user_id);
create policy "users own data" on outfits     for all using (auth.uid() = user_id);
create policy "users own data" on daily_logs  for all using (auth.uid() = user_id);
create policy "users own data" on trips       for all using (auth.uid() = user_id);
create policy "users own trip_days" on trip_days for all using (
  exists (select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid())
);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Supabase 대시보드에서 생성:
-- bucket: "items"    (옷 사진)
-- bucket: "outfits"  (코디 커버 이미지)
-- bucket: "logs"     (착용 일지 사진)
-- bucket: "trips"    (여행 커버 이미지)
-- bucket: "avatars"  (프로필 사진)
-- 모두 private, RLS로 본인만 접근

-- ============================================
-- UPDATED_AT 자동 갱신 트리거
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger items_updated_at    before update on items    for each row execute function update_updated_at();
create trigger outfits_updated_at  before update on outfits  for each row execute function update_updated_at();
create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
```

---

## 4. Next.js 프로젝트 구조

```
wardrobe/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── layout.tsx              ← 바텀 네비게이션 포함
│   │   ├── page.tsx                ← 홈 (오늘 날씨 + AI 추천 + 최근 기록)
│   │   ├── closet/
│   │   │   ├── page.tsx            ← 옷장 메인 (카테고리 그리드)
│   │   │   ├── [id]/page.tsx       ← 아이템 상세
│   │   │   └── new/page.tsx        ← 아이템 등록
│   │   ├── outfits/
│   │   │   ├── page.tsx            ← 코디 목록
│   │   │   ├── [id]/page.tsx       ← 코디 상세
│   │   │   └── new/page.tsx        ← 코디 만들기 (드래그 배치)
│   │   ├── calendar/
│   │   │   └── page.tsx            ← 착용 캘린더
│   │   ├── trips/
│   │   │   ├── page.tsx            ← 여행 목록
│   │   │   ├── [id]/page.tsx       ← 여행 상세 (일차별 코디)
│   │   │   └── new/page.tsx        ← 여행 만들기
│   │   ├── stats/
│   │   │   └── page.tsx            ← 스타일 통계
│   │   └── profile/
│   │       └── page.tsx            ← 내 프로필 + 사이즈 정보
│   ├── api/
│   │   ├── ai/recommend/route.ts   ← Claude API 코디 추천
│   │   ├── ai/analyze/route.ts     ← Claude API 스타일 분석
│   │   ├── bg-remove/route.ts      ← remove.bg 프록시
│   │   └── weather/route.ts        ← Open-Meteo 날씨
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                         ← 원자 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── FilterChip.tsx
│   │   ├── Badge.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── ColorPicker.tsx         ← hex 컬러 선택 UI
│   │   └── ImageUpload.tsx         ← 압축 + 미리보기
│   ├── items/
│   │   ├── ItemCard.tsx            ← 그리드용 카드
│   │   ├── ItemForm.tsx            ← 등록/수정 폼
│   │   ├── ItemDetail.tsx          ← 상세 뷰
│   │   └── SizeInput.tsx           ← 복합 사이즈 입력
│   ├── outfits/
│   │   ├── OutfitCard.tsx
│   │   ├── OutfitBuilder.tsx       ← 드래그 배치 캔버스
│   │   └── OutfitGrid.tsx          ← 6x4 레이아웃 렌더러
│   ├── calendar/
│   │   ├── CalendarGrid.tsx
│   │   └── DayDetail.tsx
│   ├── ai/
│   │   ├── RecommendCard.tsx       ← AI 추천 결과
│   │   └── StyleChat.tsx           ← AI와 대화
│   └── layout/
│       ├── BottomNav.tsx
│       ├── TopBar.tsx
│       └── PageContainer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← 브라우저용
│   │   ├── server.ts               ← 서버 컴포넌트용
│   │   └── middleware.ts
│   ├── utils/
│   │   ├── image.ts                ← 압축, 리사이즈
│   │   ├── color.ts                ← hex 처리, 유사색 검색
│   │   └── size.ts                 ← 사이즈 단위 변환
│   └── constants/
│       ├── categories.ts           ← 기본 카테고리 트리
│       ├── colors.ts               ← 기본 컬러 팔레트 (버터, 연청 등)
│       └── sizes.ts
├── hooks/
│   ├── useItems.ts
│   ├── useOutfits.ts
│   ├── useCalendar.ts
│   ├── useWeather.ts
│   └── useAI.ts
├── types/
│   └── index.ts                    ← 전체 타입 정의
├── public/
│   └── fonts/                      ← Pretendard 폰트
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 5. 환경변수 (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# remove.bg (선택)
REMOVEBG_API_KEY=your_removebg_api_key

# Open-Meteo는 무료, 키 불필요
```

---

## 6. 페이지별 스펙

### 🏠 홈 (/)
- 상단: 오늘 날씨 (위치 기반, Open-Meteo)
- 어제 입은 코디 미리보기 (있으면)
- AI 추천 버튼 → `/api/ai/recommend` 호출
  - 오늘 날씨 + 어제 코디 + 최근 7일 착용 기록 + 유저 스타일 프로필 전달
  - 추천 코디 3세트 반환 (아이템 ID 조합)
- 최근 등록 아이템 3개
- 하단: 바텀 네비 (홈 / 옷장 / + / 코디 / 캘린더)

### 👗 옷장 (/closet)
- 대분류 탭 (상의/하의/아우터/신발/가방/악세서리)
- 필터칩 행: 색상 · 브랜드 · 시즌 · 즐겨찾기
- 텍스트 검색
- 그리드 (2열, 정사각형 이미지)
- FAB (+) → 아이템 등록

### 📝 아이템 등록 (/closet/new)
**섹션 1 - 사진**
- 드래그로 순서 변경 가능, 최대 5장
- 첫 번째 = 대표 사진 (PRIMARY 뱃지)
- 업로드 전 자동 압축 (browser-image-compression, 최대 1MB)
- 각 사진마다 "배경 제거" 버튼 (remove.bg 호출)

**섹션 2 - 기본 정보**
- 이름 (필수)
- 카테고리 선택 (대분류 → 소분류 2단계)
- 색상 선택: 기본 컬러칩 (버터, 연청, 진청, 블랙, 화이트, 그레이, 멜란지, 네이비, 카키, 베이지, 브라운, 레드, 핑크, 퍼플, 옐로우, 오렌지, 그린) + "직접 입력" → 컬러피커 (hex)
- 소재 (텍스트)
- 시즌 (사계절 / 봄가을 / 여름 / 겨울)
- 메모

**섹션 3 - 구매 정보 (모두 optional)**
- 브랜드
- 구매처
- 구매가격
- 구매날짜 (date picker)

**섹션 4 - 사이즈 (optional)**
- 기본 라벨: S/M/L/XL, 숫자(26/28...), 커스텀 텍스트
- 국제 사이즈: US / UK / JP / EU
- 실측 (accordion으로 숨겨두기):
  - 상의: 어깨너비, 가슴둘레, 총장, 소매길이
  - 하의: 허리둘레, 힙둘레, 허벅지둘레, 밑단둘레, 밑위, 인심
  - 신발: 발 길이(mm)

### 🎨 코디 만들기 (/outfits/new)
- 좌측: 내 옷장 (카테고리 필터 + 스크롤)
- 우측: 6x4 캔버스 (옷 드래그해서 배치)
- 아이템 탭해서 추가 → 캔버스에서 위치/크기 조절
- 완성 후: 이름 입력, 태그, 저장
- 저장 시 캔버스를 이미지로 캡처 (html2canvas)

### 📅 캘린더 (/calendar)
- 월간 달력 (사진이 날짜 셀을 채움, 레퍼런스 이미지 참고)
- 날짜 탭 → 당일 기록 상세 (코디 or 사진 + 날씨 + 메모)
- + 버튼 → 오늘 착용 기록 (코디 선택 or 사진 직접 업로드)

### ✈️ 여행 (/trips)
- 여행 카드 목록 (커버 이미지 + 이름 + 날짜)
- 여행 상세: 일차별 탭 → 날씨 + 코디 카드
- 코디 없는 날 → "코디 추가" → 기존 코디 선택 or 새로 만들기

### 📊 통계 (/stats)
- 요약: 아이템 수 / 코디 수 / 착용 기록 수
- 카테고리 도넛 차트
- 색상 분포 바 차트
- 브랜드별 금액 순위
- 착용 빈도 히트맵 (잘 안 입은 옷 발굴)
- 스타일 키워드 태그 클라우드

### 👤 프로필 (/profile)
- 아바타, 닉네임
- **나의 스타일 정보** (핵심 섹션)
  - 퍼스널 컬러 (봄웜/여름쿨/가을웜/겨울쿨)
  - 피부 톤
  - 체형
  - 좋아하는 스타일 키워드
  - 선호/비선호 색상
  - 자유 메모 (나중에 메이크업 등 확장용)
- **나의 사이즈 기준** (대표 사이즈)
  - 상의 기준 사이즈 + 실측
  - 하의 기준 사이즈 + 실측
  - 신발 사이즈
  - → 이 정보가 AI 추천 + 신상 구매 비교에 활용됨

---

## 7. AI 추천 API 스펙 (/api/ai/recommend)

```typescript
// Request
{
  weather: { temp_min: number, temp_max: number, condition: string },
  recent_logs: DailyLog[],        // 최근 7일 착용 기록
  user_profile: Profile,          // 스타일 프로필
  available_items: Item[],        // 현재 옷장 아이템 (이미지 URL 포함)
}

// System Prompt 핵심
`당신은 개인 스타일리스트입니다.
사용자의 퍼스널 컬러는 ${personalColor}, 선호 스타일은 ${styleKeywords}입니다.
오늘 날씨: ${weather.temp_min}~${weather.temp_max}°C, ${weather.condition}
어제 입은 옷: ${yesterday}
최근 7일 동안 입지 않은 아이템을 우선 활용해주세요.
아래 옷장에서 코디 3세트를 추천해주세요. 각 세트는 item_id 배열로 반환하세요.
JSON 형식: { "outfits": [{ "items": ["id1", "id2"], "reason": "추천 이유" }] }`

// Response
{
  outfits: Array<{
    items: string[],    // item ids
    reason: string,
  }>
}
```

---

## 8. 기본 컬러 팔레트 상수

```typescript
// lib/constants/colors.ts
export const PRESET_COLORS = [
  { label: '블랙',    hex: '#1A1A1A' },
  { label: '화이트',  hex: '#FAFAFA' },
  { label: '그레이',  hex: '#9E9E9E' },
  { label: '멜란지',  hex: '#B0ADAB' },
  { label: '네이비',  hex: '#1B2A4A' },
  { label: '연청',    hex: '#A8C4D8' },
  { label: '진청',    hex: '#2B5F8E' },
  { label: '베이지',  hex: '#D4C4A8' },
  { label: '버터',    hex: '#F5E6C8' },
  { label: '브라운',  hex: '#6B3F2A' },
  { label: '카키',    hex: '#7A7A52' },
  { label: '올리브',  hex: '#6B6B3A' },
  { label: '그린',    hex: '#4A7C59' },
  { label: '레드',    hex: '#C0392B' },
  { label: '버건디',  hex: '#6D1E2C' },
  { label: '핑크',    hex: '#E8A0B0' },
  { label: '퍼플',    hex: '#7B5EA7' },
  { label: '옐로우',  hex: '#F2C94C' },
  { label: '오렌지',  hex: '#E07B39' },
  // + 직접 입력 (hex color picker)
];
```

---

## 9. 기본 카테고리 트리

```typescript
// lib/constants/categories.ts
export const DEFAULT_CATEGORIES = [
  {
    name: '상의',
    children: ['티셔츠', '블라우스', '셔츠', '니트', '맨투맨', '후드', '탑', '민소매'],
  },
  {
    name: '하의',
    children: ['팬츠', '숏팬츠', '데님', '카고', '슬랙스', '스커트', '레깅스', '조거'],
  },
  {
    name: '아우터',
    children: ['코트', '재킷', '패딩', '가디건', '바람막이', '점퍼', '베스트'],
  },
  {
    name: '신발',
    children: ['스니커즈', '로퍼', '부츠', '샌들', '힐', '플랫슈즈', '슬리퍼'],
  },
  {
    name: '가방',
    children: ['숄더백', '크로스백', '에코백', '클러치', '백팩', '토트백'],
  },
  {
    name: '악세서리',
    children: ['목걸이', '귀걸이', '반지', '팔찌', '벨트', '모자', '스카프', '선글라스'],
  },
];
```

---

## 10. 개발 순서 추천

```
Phase 1 — 기반 (1~2일)
  ✓ 프로젝트 세팅 + 디자인 토큰
  ✓ Supabase 스키마 적용
  ✓ Auth (로그인/회원가입)
  ✓ 바텀 네비 + 레이아웃

Phase 2 — 핵심 (3~5일)
  ✓ 아이템 등록 (사진 업로드 + 압축 포함)
  ✓ 옷장 목록 (필터 + 검색)
  ✓ 아이템 상세

Phase 3 — 코디 & 캘린더 (3~4일)
  ✓ 코디 빌더 (드래그 배치)
  ✓ 착용 캘린더

Phase 4 — AI & 부가 (2~3일)
  ✓ AI 코디 추천 (Claude API)
  ✓ 날씨 연동
  ✓ 배경 제거 (remove.bg)
  ✓ 통계
  ✓ 여행 플래너

Phase 5 — 마무리
  ✓ 프로필 + 사이즈 정보
  ✓ Vercel 배포
  ✓ PWA 설정 (홈 화면 추가 가능하게)
```

---

*문서 버전: 1.0 | 생성일: 2026-06-22*