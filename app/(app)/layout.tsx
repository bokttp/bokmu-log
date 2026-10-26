import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 로그인 필수 영역. proxy.ts가 먼저 막지만, 서버에서 한 번 더 확인한다.
// 온보딩 확인과 하단 탭은 2주차·4주차에 추가한다.
async function RequireUser({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return children;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />}>
        <RequireUser>{children}</RequireUser>
      </Suspense>
    </div>
  );
}
