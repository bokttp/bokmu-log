import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProfile, getServicePeriods } from "@/lib/data";
import { isDemoMode } from "@/lib/demo";
import ProfileForm from "@/components/profile-form";

// 첫 로그인 후 복무 정보 입력 (F-02). 로그인은 proxy.ts가 확인한다.
export const instant = false; // app/(app)/layout.tsx 참고

async function OnboardingForm() {
  const [profile, periods] = await Promise.all([getProfile(), getServicePeriods()]);
  // 이미 마친 사용자는 대시보드로 (데모 모드는 화면 확인을 위해 그대로 보여준다)
  if (profile?.onboarded && !isDemoMode()) redirect("/dashboard");

  return <ProfileForm profile={isDemoMode() ? null : profile} periods={periods} mode="onboarding" />;
}

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-emerald-800 dark:text-emerald-400">
          복무로그
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-8 md:items-center md:py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-10 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">처음 오셨네요</p>
          <h1 className="mt-1 text-2xl font-bold">복무 정보를 알려 주세요</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            입대일로 전역일과 복무율을 계산해요. 부대명이나 실명은 받지 않아요.
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />}>
              <OnboardingForm />
            </Suspense>
          </div>
          <p className="mt-4 text-xs text-zinc-500">입력한 정보는 나중에 설정에서 바꿀 수 있어요.</p>
        </div>
      </main>
    </div>
  );
}
