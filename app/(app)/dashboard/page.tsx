import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

// 1주차: 로그인 확인용 임시 화면. 전역 카드·요약·잔디는 2~4주차에 채운다.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">홈</h1>
      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">로그인한 계정</p>
        <p className="mt-1 font-semibold">{user?.email}</p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-300 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          로그아웃
        </button>
      </form>
    </main>
  );
}
