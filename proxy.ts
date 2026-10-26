import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16에서 middleware.ts가 proxy.ts로 이름이 바뀌었다.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 정적 파일과 이미지는 제외
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
