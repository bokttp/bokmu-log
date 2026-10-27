import "server-only";
import { createClient } from "@supabase/supabase-js";

// 관리자 권한(service role) 클라이언트. RLS를 건너뛰므로 회원 탈퇴처럼 꼭 필요한 곳에서만 쓴다.
// 키는 Vercel–Supabase 연동이 넣어 준 서버 전용 환경변수다 (NEXT_PUBLIC_ 아님).
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
