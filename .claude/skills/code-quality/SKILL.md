---
name: code-quality
description: WIMC 코드를 컨벤션 기준으로 점검하고 개선하는 스킬. "코드 개선", "리팩터", "리뷰해줘", "정리해줘", "컨벤션 점검" 요청 시 트리거한다. AGENTS.md "코드 컨벤션"을 기준으로 검토 후 고친다.
---

# Code-Quality — WIMC 코드 점검·개선

변경된 코드가 컨벤션을 지키는지 점검하고, 위반은 `파일:라인`으로 보고한 뒤 고친다.

> 규칙 기준: `AGENTS.md` "코드 컨벤션", "데이터 계층 패턴", "데이터 저장 정책"
> 데이터 흐름·컴포넌트 구현 절차는 `data-flow`·`component` 스킬 참조.

## Step 1: 변경 파일 확인

```bash
git diff --name-only HEAD
```

각 파일을 읽고 아래 체크리스트로 점검한다.

## Step 2: 체크리스트 (AGENTS.md "코드 컨벤션" quick-reference)

**구조·위치**
- [ ] 읽기는 `lib/data/*`, 쓰기는 라우트의 `actions.ts`, 공용 UI는 `components/ui`, 순수 로직은 `lib/utils`에 있는가?

**데이터 계층 (정적 껍데기 + TanStack Query)**
- [ ] `page.tsx`에 `await getX()` 같은 데이터 패칭이 없는가(정적 껍데기)? 패칭은 `*View`/`*Screen`이 훅으로 하는가?
- [ ] 읽기는 `app/api/*` 핸들러 + `lib/queries` 훅을 거치는가(클라이언트에서 `lib/data` 직접 import 금지)?
- [ ] 쓰기 후 `router.refresh()` 대신 `queryClient.invalidateQueries`로 올바른 키를 무효화했는가?
- [ ] `isLoading` 스켈레톤·빈 상태를 처리했는가?

**중복**
- [ ] 같은 패턴이 3회 이상/거의 동일하면 공통화했는가? (그 전엔 인라인 유지 — 이른 추상화 금지)

**색상·토큰**
- [ ] Panda 토큰만 쓰는가? 하드코딩 hex/rgba 없는가? (온-다크=`white`, 딤=`overlay`/`scrim`, 동적 hex만 `style` 예외)

**마크업·접근성**
- [ ] 불필요한 `div` 래핑이 없고 의미 요소를 쓰는가? 클릭은 `button`/`a`인가?
- [ ] 아이콘 전용 버튼에 `aria-label`, 색만으로 상태 전달 금지, `inputMode`/`label` 연결됐는가?

**스타일**
- [ ] active/조건부 스타일이 단일 `css()` 조건부인가? (`cx(base, active && css(...))`로 같은 속성 덮어쓰기 금지)

**정리**
- [ ] 미사용 export·죽은 코드·임시 `console`이 없는가?

## Step 3: 검증 명령

```bash
npx tsc --noEmit
npm run lint
npm run build   # dev 서버가 떠 있으면 충돌하니 그때는 생략
```

실패 시 에러 메시지 전체를 보고에 포함한다.

## Step 4: 수정

점검에서 나온 위반을 컨벤션에 맞게 고친다. 범위가 커지면 무리하지 말고 분리(다음 작업)를 제안한다.

## 자가 확인

- [ ] 모든 지적에 `파일:라인`을 명시했는가?
- [ ] tsc·lint를 실행하고 결과를 포함했는가?
- [ ] 수정이 컨벤션(토큰·접근성·중복 기준)을 따르는가?
