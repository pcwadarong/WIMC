import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * 현재 로그인 유저. React cache로 감싸 한 번의 요청(렌더) 안에서는
 * 여러 번 호출해도 Supabase 인증 왕복을 1회로 합친다.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  // getClaims: 비대칭 서명키면 JWT 로컬 검증(네트워크 0), 아니면 getUser 폴백.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string; email?: string } | undefined;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: claims.email ?? null };
});
