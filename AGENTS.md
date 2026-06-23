# WIMC — 개발 메모

개인 옷장 관리 + 코디 기록 + AI 스타일 추천 웹앱. 전체 설계는 `design.md` 참고.

## 스택

- Next.js 15 (App Router) + React 19 + TypeScript
- Panda CSS (빌드타임 CSS-in-JS, 디자인 토큰은 `panda.config.ts`)
- Supabase (Auth / Postgres / Storage, RLS)
- TanStack Query v5 (클라이언트 데이터 캐싱 — `components/providers/QueryProvider.tsx`)
- 폰트: Pretendard (globals.css 에서 CDN 로드)
- 배포: Vercel(서울 `icn1`), 패키지 매니저 pnpm

## 코드 컨벤션 (단일 출처 — 스킬은 이 섹션을 참조)

### 폴더 구조

- `app/(app)/*` 앱 라우트(바텀네비 그룹, **정적 껍데기 page.tsx**), `app/(auth)/*` 인증 화면, `app/api/*` 읽기용 라우트 핸들러(GET).
- 읽기 = `lib/data/*` (server-only, 단일 출처) → `app/api/*`로 노출 → 클라이언트는 `lib/queries/*` 훅으로 소비. 쓰기 = 각 라우트의 `actions.ts` (server actions).
- `components/ui/*` 공용 원자(Button/Input/Toast/Skeleton/BottomSheet 등), `components/{feature}/*` 기능별(items/outfits/calendar/trips/profile/home/stats/layout/auth/providers). 데이터를 훅으로 가져오는 컨테이너는 `*View`/`*Screen` 네이밍.
- `lib/utils/*` 순수 유틸, `lib/queries/*` 쿼리 훅·키, `lib/constants/*` 상수, `lib/prompts/*` 프롬프트 텍스트, `types/index.ts` 전역 타입.
- 새 공통 로직은 `lib/utils`, 새 공용 UI는 `components/ui`에 둔다.

### 중복 / 추출 기준

- 같은 패턴이 **3회 이상 반복**되거나 **거의 동일**(구조·스타일이 사실상 같음)하면 공통 컴포넌트/유틸로 추출한다.
- 그 전에는 인라인 유지 — **이른 추상화·과한 일반화 금지** (MVP 기준 작게).
- 범위가 커지면 무리하지 말고 분리(다음 작업)로 제안한다.

### 색상 / 토큰

- **Panda 토큰만** 사용한다. 하드코딩 hex/rgba 금지.
- 온-다크 텍스트 = `white`, 이미지 위 딤 = `overlay`/`overlayStrong`, 모달/시트 딤 = `scrim`.
- 동적 색(유저가 고른 hex 등)만 `style={{ background: hex }}`로 예외 허용.

### 마크업 / 접근성

- 불필요한 `div` 래핑 금지. 의미 요소(`section/header/nav/ul/li/button/a`)를 쓰고, 묶음만 필요하면 Fragment.
- 클릭 가능한 건 `<button>`/`<a>` (div+onClick 금지). 아이콘 전용 버튼엔 `aria-label`.
- 색만으로 상태를 전달하지 않는다(텍스트/아이콘 병행). 숫자 입력은 `inputMode`, 폼은 `label`/`id` 연결.

### 스타일 / 인터랙션

- `@/styled-system/css`의 `css()`/`cx()` 사용. active/조건부 스타일은 **단일 `css()` 안에서 조건부**로(원자 클래스 충돌 방지 — `cx(base, active && css(...))`로 같은 속성을 덮어쓰지 않기).
- 마이크로 인터랙션은 Panda 키프레임/트랜지션으로(hover/active/진입). 외부 애니메이션 라이브러리는 도입하지 않는다(필요 시 논의).

## 핵심 규칙

- **모바일 퍼스트**: 최대 너비 `app` 토큰(430px), `(app)` 그룹 레이아웃에서 가운데 정렬 + 바텀 네비.
- **바텀 네비**: 홈 / 옷장 / 코디 / 캘린더 / 마이(`/profile`). 추가는 페이지별 우측하단 FAB(옷장→아이템, 캘린더→기록, 여행/코디 각자). 분석은 마이 안(`/stats`), 여행은 캘린더 안(`/trips`), 위시리스트는 옷장 "구매고민" 상태 필터.
- **on-dark 텍스트는 `color: "white"`** 토큰 사용(브라운 배경 버튼/탭/FAB). `surface`(흰색)와 혼동 주의.
- **스타일링**: `@/styled-system/css` 의 `css()` / `cx()` 와 디자인 토큰 사용. 임의 hex 대신 토큰(`brown.dark`, `text.secondary`, `surface` 등)을 쓴다.
- **Supabase 클라이언트**: 브라우저 `lib/supabase/client.ts`, 서버 `lib/supabase/server.ts`(`cookies()` await 필요), 세션 갱신 `lib/supabase/middleware.ts`.
- 환경변수 미설정 시 미들웨어가 인증 게이팅을 건너뛴다(초기 개발용). `.env.local` 채우면 자동 활성화.
- DB 스키마는 `supabase/schema.sql` (Supabase SQL Editor에 실행).

## 명령어

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (Panda codegen은 `prepare`에서 자동 실행)
- `npm run lint` — ESLint
- `npx panda codegen` — 토큰 변경 후 `styled-system/` 재생성

## 진행 상황

- ✅ 기반: 프로젝트 세팅, 디자인 토큰, 바텀 네비/레이아웃, 타입, 스키마, 미들웨어, 토스트(`ToastProvider`/`useToast`)
- ✅ Auth: 로그인/회원가입(`AuthForm`) · 비밀번호 재설정/변경(`/account/update-password`) · 이메일 확인(`/auth/confirm`)·환영(`/welcome`) · 로그아웃 · 미들웨어 게이팅
- ✅ 옷장: 등록(`/closet/new`, 압축+스토리지) · 목록(탭/필터/검색/정렬/FAB) · 상세(즐겨찾기/삭제) · 위시리스트(구매고민 필터)
- ✅ 코디: 빌더(`OutfitBuilder`, 생성/수정) · 목록 · 상세 · 삭제
- ✅ 캘린더: 월 그리드(이미지 뷰어) · 일별 기록(`DayLogForm`, 사진/코디/메모) · 이번 달 요약 · 여행(`/trips`)
- ✅ 통계(`/stats`): 지출·카테고리·색상·브랜드·착용당비용·미착용 등
- ✅ 프로필(`/profile`): 나의 스타일(키워드/분석 붙여넣기) · 위치 · 프로필 사진 · 설정/문의(`inquiries` 테이블)
- ✅ 날씨+추천(규칙기반): `/api/weather`(Open-Meteo) + `lib/recommend.ts` + 홈 `TodayPanel` + 프롬프트 복사
- ✅ **데이터 계층 전환**: 정적 껍데기 + TanStack Query(아래 "데이터 계층 패턴"). 주요 탭 ○ Static 프리렌더.
- ⬜ 다음: PWA(나중), 감성 테마 시스템(Later), AI 인앱 자동화(유료 API 필요 시)

## AI 추천 전략 (중요)

- 사용자는 LLM **API 키 없음**(Claude/ChatGPT 구독만), 사용자 없는 동안 비용 회피. 현재는 **무료 규칙기반(`lib/recommend.ts`)** + **프롬프트 복사(B안)**로 운영.
- 추천 엔진은 `recommend(weather, items, categoryMap) → Recommendation` 시그니처로 **교체 가능**하게 설계. 추후 Gemini 무료티어 또는 Anthropic Haiku로 같은 자리만 교체.

## 데이터 저장 정책 (중요)

- **영구 데이터는 전부 서버(Supabase)에 저장**: 아이템·프로필·카테고리·코디·착용기록 등은 Postgres, 이미지는 Storage. 클라이언트에 영구 사본을 두지 않는다.
- **클라이언트(브라우저)에 남는 값은 최소화, 용도 한정**:
  - 인증 세션: Supabase가 쿠키에 저장(서버·미들웨어와 공유) — 유일하게 브라우저에 영속.
  - 폼 입력값: 컴포넌트 state(메모리)만 사용, 제출 시 서버로. 새로고침하면 사라짐. (등록 폼 draft의 localStorage 임시저장은 추후 옵션)
  - 추천용 위치: GPS는 1회성(저장 안 함). 추후 마이페이지에서 고른 도시를 **프로필(서버)** 에 저장해 사용.
- **민감정보(키·DB주소 등)는 클라이언트 코드/AI 프롬프트에 절대 포함하지 않는다.** (프롬프트의 "내 옷장 목록"은 옷 메타데이터 텍스트일 뿐)

## 데이터 계층 패턴 (정적 껍데기 + TanStack Query)

- **렌더 구조**: `app/(app)/*/page.tsx`는 **데이터 fetch 없는 정적 Server Component 껍데기**(제목/레이아웃/FAB만). 유저 데이터는 클라이언트 컴포넌트(예: `ClosetView`, `OutfitsList`, `CalendarView`, `HomeView`, `*Screen`)가 **TanStack Query 훅**으로 가져온다. → 주요 탭이 ○ Static 프리렌더되어 라우팅 즉시, 데이터는 캐시/스켈레톤으로 채움.
- **읽기**: `lib/data/*`(server-only)는 그대로 단일 출처. 이를 **route handler `app/api/*`**(GET, `getItems`/`getOutfit`/`getMonthLogs`/`getStats` 등 호출, `force-dynamic`)로 노출 → 클라이언트는 `lib/queries/hooks.ts`의 `useItems`/`useOutfits`/… (`useQuery`)로 소비. queryKey는 `lib/queries/keys.ts`(`qk`) 중앙 관리. 카테고리 시드·통계 집계는 서버(handler)에서 처리.
- **쓰기**: 페이지별 `actions.ts` server actions 유지(`createItem` 등). 클라이언트 폼/버튼은 성공 후 `router.refresh()` 대신 **`queryClient.invalidateQueries({ queryKey: ["items"] })`** 로 캐시 무효화(prefix 매칭). 무효화 키: items/outfits/logs/profile/trips/stats. (`invalidateQueries(["items"])`는 list·detail·summary 모두 무효화.)
- **로딩**: 훅 `isLoading` → 데이터 영역에 `components/ui/Skeleton`(`Skeleton`/`GridSkeleton`, `pulse` 키프레임). 라우트 `loading.tsx`는 두지 않는다(껍데기가 즉시).
- **편집 폼**: `ItemForm`/`OutfitBuilder`처럼 초기값을 useState 초기화에 쓰는 폼은 비동기 데이터를 직접 받지 말고 **`*Screen` 컨테이너가 데이터 준비 후 prop으로** 넘긴다(준비 전엔 스켈레톤).
- **날짜 기본값**: 정적 프리렌더에서 `new Date()` 빌드 고정을 피하려면 **클라이언트에서 계산**(예: `DayLogScreen`의 오늘 날짜 `useState` 초기화).
- 이미지 업로드: 클라이언트에서 압축(`lib/utils/image.ts`) 후 브라우저 Supabase로 `items/{user_id}/{uuid}.webp` 업로드 → public URL을 `items.images`(jsonb)에 저장.
- Storage: **public 버킷 5개**(items/outfits/logs/trips/avatars) + `supabase/storage-policies.sql`(본인 폴더만 쓰기, 읽기 공개).
- **인증 검증**: 읽기 경로는 `lib/data/auth.ts:getCurrentUser`(React `cache` + `getClaims` 로컬 검증). 쓰기 action은 `auth.getUser()`(서버 검증) 사용.

## Auth 메모

- 로그인/회원가입은 `app/(auth)/login/` (server actions: `actions.ts`).
- 신규 가입 시 `profiles` 행은 `supabase/schema.sql`의 `handle_new_user` 트리거가 생성 → **스키마 SQL을 먼저 실행해야 함**.
- Supabase 대시보드에서 "Confirm email"을 끄면 가입 즉시 로그인됨(개발 편의). 켜두면 확인 메일 링크 필요.
