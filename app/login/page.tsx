import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./login-form";
import PublicHeader from "@/components/public-header";

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
    <div className="flex flex-1 flex-col">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 shadow-md md:p-10 dark:border-sand-800 dark:bg-sand-900">
          <div className="-mx-6 -mt-6 mb-6 h-2 bg-army-700 md:-mx-10 md:-mt-10" aria-hidden />
          <h1 className="text-2xl font-bold text-army-800 dark:text-khaki-200">로그인</h1>
          <p className="mt-2 text-sand-600 dark:text-sand-400">
            이메일과 비밀번호로 로그인해요. 처음이면 회원가입을 눌러 주세요.
          </p>
          <Suspense fallback={null}>
            <LoginError searchParams={searchParams} />
          </Suspense>
          <LoginForm />
          <p className="mt-6 text-xs text-sand-500">
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
