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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        처음이면 자동으로 가입돼요. 닉네임만 따로 받아요.
      </p>
      <Suspense fallback={null}>
        <LoginError searchParams={searchParams} />
      </Suspense>
      <LoginForm />
    </main>
  );
}
