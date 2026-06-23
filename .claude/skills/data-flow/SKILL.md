---
name: data-flow
description: WIMC에서 데이터 읽기/쓰기 흐름을 추가·수정할 때의 절차 스킬. "데이터 추가", "API 추가", "새 쿼리", "읽기 추가", "useQuery 훅", "route handler", "쿼리 무효화" 요청 시 트리거한다. 정적 껍데기 + TanStack Query 패턴을 강제한다(서버 컴포넌트에서 직접 await 금지).
---

# Data-Flow — 읽기/쓰기 데이터 흐름

WIMC는 **정적 껍데기 + TanStack Query** 구조다. 페이지에서 `await getX()` 하지 말고, 아래 레시피를 그대로 따른다.

> 규칙 기준: `AGENTS.md` "데이터 계층 패턴", "데이터 저장 정책". 핵심 원칙은 거기에 있고, 여기선 **추가 절차와 템플릿**만 다룬다.

## 읽기(Read) 추가 — 5단계

새 데이터를 화면에 가져오려면 5곳을 모두 채운다. 하나라도 빠지면 동작 안 한다.

**① `lib/data/*.ts`** (server-only) — 쿼리 함수. 인증은 `getCurrentUser()`로.
```ts
export async function getThings(): Promise<Thing[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();        // lib/data/auth.ts (캐시됨)
  if (!user) return [];
  const { data } = await supabase.from("things").select("*").eq("user_id", user.id);
  return (data as Thing[]) ?? [];
}
```

**② `app/api/things/route.ts`** — GET 핸들러로 노출. `lib/data`를 그대로 호출.
```ts
import { getThings } from "@/lib/data/things";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(await getThings());
}
```
- path 파라미터: `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params;` (Next 15).
- 쿼리스트링: `new URL(req.url).searchParams`.

**③ `lib/queries/keys.ts`** — queryKey 추가(`qk`). prefix 무효화 고려해 계층적으로.
```ts
things: () => ["things", "list"] as const,
thing: (id: string) => ["things", "detail", id] as const,
```

**④ `lib/queries/hooks.ts`** — `useQuery` + `fetchJson`.
```ts
export function useThings() {
  return useQuery({ queryKey: qk.things(), queryFn: () => fetchJson<Thing[]>("/api/things") });
}
```
- 조건부 로딩이 필요하면 `opts?: { enabled?: boolean }`를 받아 `enabled`에 전달(예: `useItems`).

**⑤ 컴포넌트에서 소비** — `*View`/`*Screen` 컨테이너(client)가 훅을 호출. `isLoading` → `Skeleton`/`GridSkeleton`.
```tsx
const { data: things = [], isLoading } = useThings();
if (isLoading) return <GridSkeleton />;
```
page.tsx는 **데이터 없는 정적 껍데기**로 두고 이 컨테이너만 렌더한다.

## 쓰기(Write) 추가·변경

**① server action 유지** — 페이지별 `actions.ts`(예: `app/(app)/closet/actions.ts`). 쓰기 검증은 `auth.getUser()`(서버 검증).

**② 호출 후 캐시 무효화** — 클라이언트 폼/버튼에서 `router.refresh()` **금지**, 대신:
```ts
const queryClient = useQueryClient();      // @tanstack/react-query
// ...action 성공 후
queryClient.invalidateQueries({ queryKey: ["things"] });   // prefix로 list·detail 모두
router.push("/things");                    // 이동만 router로
```

**무효화 키 매핑**(prefix 매칭):

| action | invalidate |
| --- | --- |
| createItem/updateItem/deleteItem/toggleFavorite | `["items"]` (+ 지출 변동 시 `["stats"]`) |
| createOutfit/updateOutfit/deleteOutfit | `["outfits"]` |
| upsertLog/deleteLog | `["logs"]`, `["stats"]` |
| createTrip/deleteTrip | `["trips"]`; setTripDay → `["trips","detail",tripId]` |
| updateProfile | `["profile"]` |

## 주의

- **편집 폼**(`ItemForm`/`OutfitBuilder` 등 초기값을 useState에 쓰는 폼)은 비동기 데이터를 직접 받지 말고, `*Screen` 컨테이너가 훅으로 준비한 뒤 **prop으로** 넘긴다(준비 전 스켈레톤).
- 정적 프리렌더에서 `new Date()`는 빌드 시점에 고정된다 → 오늘 날짜 등은 **클라이언트에서 계산**(`useState` 초기화).
- `lib/data/*`는 `import "server-only"` 유지 — 클라이언트에서 직접 import 금지(타입은 `import type`만).

## 검증

```bash
npx tsc --noEmit
npx next lint --dir app --dir lib --dir components
npx next build   # 주요 탭이 ○ Static 인지 라우트 표 확인 (dev 서버 떠 있으면 생략)
```

## 자가 확인

- [ ] 읽기 5단계(data → api → keys → hooks → 컴포넌트)를 모두 채웠는가?
- [ ] page.tsx에 `await getX()`가 남아있지 않은가(정적 껍데기)?
- [ ] 쓰기 후 `router.refresh()` 대신 `invalidateQueries`로 정확한 키를 무효화했는가?
- [ ] `isLoading` 스켈레톤·빈 상태를 처리했는가?
- [ ] tsc/lint를 통과했는가?
