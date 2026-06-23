import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래를 제외한 모든 경로에 적용:
     * - _next/static, _next/image (정적 자산)
     * - favicon.ico, 이미지 파일
     * - PWA 자산: manifest / icon / apple-icon / sw.js (인증 게이트 제외)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
