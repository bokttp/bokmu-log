import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { getProfile } from "@/lib/data";
import SiteHeader from "@/components/site-header";
import BottomNav from "@/components/bottom-nav";

// 로그인 필수 영역. proxy.ts가 먼저 막지만, 서버에서 한 번 더 확인한다.
// 데모 모드(Supabase 키 없는 로컬)에서는 로그인 없이 예시 데이터로 보여준다.

// 로그인 영역은 매 요청 사용자 데이터를 읽으므로 "즉시 이동" 검사에서 제외한다.
// (Next.js 문서 'Authentication with Cache Components'의 마이그레이션 방법)
// 이 설정은 세그먼트마다 따로 적용되므로, 데이터를 읽는 각 page.tsx에도 같은 줄을 둔다.
export const instant = false;

async function RequireUser({ children }: { children: React.ReactNode }) {
  if (isDemoMode()) return children;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 복무 정보를 아직 입력하지 않았으면 온보딩으로 (F-02)
  const profile = await getProfile();
  if (!profile?.onboarded) redirect("/onboarding");

  return children;
}

// 넓은 화면: 상단 메뉴 + 최대 1152px 본문. 휴대폰: 하단 탭.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {isDemoMode() && (
        <p className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-100">
          데모 모드 — 예시 데이터예요. 저장은 되지 않아요.
        </p>
      )}
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-24 md:px-8 md:pt-10 md:pb-16">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-sand-100 dark:bg-sand-900" />}>
          <RequireUser>{children}</RequireUser>
        </Suspense>
      </div>
      <BottomNav />
    </>
  );
}
