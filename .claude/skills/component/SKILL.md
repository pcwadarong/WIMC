---
name: component
description: WIMC에서 새 UI 컴포넌트·화면을 구현할 때의 절차 스킬. "컴포넌트 만들어줘", "화면 구현", "UI 추가", "페이지 만들어줘", "버튼/카드/시트 컴포넌트" 요청 시 트리거한다. Panda 토큰·접근성·정적 껍데기/컨테이너 패턴을 강제한다.
---

# Component — UI 컴포넌트·화면 구현

컴포넌트를 만들 때의 위치·구조·스타일·접근성 절차. 데이터 패칭이 필요하면 **`data-flow` 스킬**과 함께 쓴다.

> 규칙 기준: `AGENTS.md` "코드 컨벤션"(폴더 구조·중복·색상/토큰·마크업/접근성·스타일). 여기선 **구현 순서와 패턴**만 다룬다.

## Step 1: 위치·네이밍 결정

- 재사용 원자(버튼·인풋·시트·스켈레톤) → `components/ui/*`.
- 기능 전용 → `components/{feature}/*` (items/outfits/calendar/trips/profile/home/stats).
- **데이터를 훅으로 가져오는 컨테이너**는 `*View`(목록형) / `*Screen`(상세·폼형)으로 명명. page.tsx는 정적 껍데기.
- **추출 시점**: 같은 패턴이 3회 이상/거의 동일할 때만. 그 전엔 인라인(이른 추상화 금지).

## Step 2: 페이지면 정적 껍데기로

`app/(app)/*/page.tsx`는 제목·레이아웃·FAB 같은 **정적 chrome만** 두고, 데이터는 client 컨테이너에 위임한다.
```tsx
export default function ThingsPage() {
  return (
    <PageContainer>
      <h1 className={css({ textStyle: "2xl", fontWeight: 700, color: "text.primary" })}>제목</h1>
      <ThingsView />          {/* client, 훅으로 패칭 */}
      <Fab href="/things/new" label="추가" />
    </PageContainer>
  );
}
```
- 동적 파라미터(`[id]`)는 `await params`로 받아 `<ThingScreen id={id} />`에 prop으로 전달(껍데기는 DB 미접근).
- `useSearchParams`를 쓰는 컨테이너는 page에서 `<Suspense>`로 감싼다(캘린더 `?m=` 참고).

## Step 3: 스타일 — Panda 토큰만

- `@/styled-system/css`의 `css()`/`cx()` 사용. 하드코딩 hex/rgba 금지(동적 hex만 `style` 예외).
- 토큰 예: `brown.dark`/`text.secondary`/`surface`/`surface.muted`/`border`. 온-다크 텍스트는 `color: "white"`.
- 조건부 스타일은 **단일 `css()` 안에서 조건부**. `cx(base, active && css({...}))`로 같은 속성을 덮어쓰지 않는다(원자 클래스 충돌).
```tsx
className={css({ bg: active ? "brown.dark" : "surface.muted", color: active ? "white" : "text.secondary" })}
```
- 마이크로 인터랙션은 Panda 키프레임/트랜지션(`_hover`/`_active`, `pulse`/`fadeIn`). 외부 애니메이션 라이브러리 도입 금지.

## Step 4: 접근성·마크업

- 불필요한 `div` 금지 — 의미 요소(`section/header/nav/ul/li/button/a`), 묶음만 필요하면 Fragment.
- 클릭은 `<button>`/`<a>`(div+onClick 금지). 아이콘 전용 버튼엔 `aria-label`.
- 색만으로 상태 전달 금지(텍스트·아이콘 병행). 숫자 입력 `inputMode`, 폼 `label`/`id` 연결.

## Step 5: 로딩·빈·에러 상태

데이터 컨테이너는 세 상태를 모두 처리한다.
```tsx
if (isLoading) return <GridSkeleton />;            // components/ui/Skeleton
if (things.length === 0) return <p className={...}>아직 없어요. + 버튼으로 추가하세요.</p>;
```
- 편집 폼은 컨테이너가 데이터 준비 후 prop으로 넘기고, 준비 전엔 스켈레톤(`ItemFormScreen`/`OutfitBuilderScreen` 참고).
- 에러·성공 피드백은 인라인 대신 `useToast().show(msg, "error"|"success")`.

## Step 6: 검증

```bash
npx tsc --noEmit
npx next lint --dir app --dir components
```

## 자가 확인

- [ ] page.tsx는 데이터 없는 정적 껍데기이고, 패칭은 `*View`/`*Screen`이 하는가?
- [ ] Panda 토큰만 썼는가(하드코딩 hex 없음)? 온-다크는 `white`인가?
- [ ] 조건부 스타일이 단일 `css()` 조건부인가(원자 클래스 충돌 없음)?
- [ ] 의미 요소·`button`/`a`·`aria-label`·`label`/`id`를 지켰는가?
- [ ] 로딩(`Skeleton`)·빈 상태를 처리했는가?
- [ ] 불필요한 추상화 없이(3회 미만은 인라인) 작게 만들었는가?
