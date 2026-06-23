import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** 인증 없이 접근 가능한 경로 */
const PUBLIC_PATHS = ["/login", "/auth", "/welcome"];

/**
 * 매 요청마다 Supabase 세션을 갱신하고, 미인증 사용자를 /login으로 보낸다.
 * Supabase 환경변수가 없으면(초기 세팅 단계) 그대로 통과시킨다.
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 아직 Supabase 미설정 → 인증 게이팅 비활성화
  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // getClaims()는 내부적으로 getSession()으로 세션을 갱신하고,
  // 비대칭 서명키(JWKS)면 JWT를 로컬 검증한다(네트워크 왕복 0).
  // 레거시 HS256이면 자동으로 getUser()로 폴백 → 기존과 동일하게 안전.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
