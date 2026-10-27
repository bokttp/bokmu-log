import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./login-form";

// searchParams는 요청 시점 데이터라 Suspense 안에서 읽는다 (Cache Components).
async function LoginError({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
      로그인에 실패했어요. 다시 시도해 주세요.
    </p>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-emerald-800 dark:text-emerald-400">
          복무로그
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-10 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            이메일과 비밀번호로 로그인해요. 처음이면 회원가입을 눌러 주세요.
          </p>
          <Suspense fallback={null}>
            <LoginError searchParams={searchParams} />
          </Suspense>
          <LoginForm />
          <p className="mt-6 text-xs text-zinc-500">
            로그인하면{" "}
            <Link href="/privacy" className="underline">
              개인정보 처리방침
            </Link>
            에 동의하는 것으로 봐요.
          </p>
        </div>
      </main>
    </div>
  );
}
