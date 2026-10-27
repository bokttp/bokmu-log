import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProfile, getServicePeriods } from "@/lib/data";
import { isDemoMode } from "@/lib/demo";
import ProfileForm from "@/components/profile-form";
import PublicHeader from "@/components/public-header";

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
    <div className="flex flex-1 flex-col">
      <PublicHeader />
      <main className="flex flex-1 items-start justify-center px-4 py-8 md:items-center md:py-12">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 shadow-md md:p-10 dark:border-sand-800 dark:bg-sand-900">
          <div className="-mx-6 -mt-6 mb-6 h-2 bg-army-700 md:-mx-10 md:-mt-10" aria-hidden />
          <p className="inline-block rounded bg-khaki-300 px-2 py-0.5 text-xs font-bold text-army-900">전입 신고</p>
          <h1 className="mt-2 text-2xl font-bold text-army-800 dark:text-khaki-200">복무 정보를 알려 주세요</h1>
          <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
            입대일로 전역일과 복무율을 계산해요. 부대명이나 실명은 받지 않아요.
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-sand-100 dark:bg-sand-800" />}>
              <OnboardingForm />
            </Suspense>
          </div>
          <p className="mt-4 text-xs text-sand-500">입력한 정보는 나중에 설정에서 바꿀 수 있어요.</p>
        </div>
      </main>
    </div>
  );
}
