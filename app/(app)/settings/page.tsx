import { getProfile, getServicePeriods } from "@/lib/data";
import { isDemoMode } from "@/lib/demo";
import { signOut } from "@/app/auth/actions";
import ProfileForm from "@/components/profile-form";

export const instant = false; // layout.tsx 참고

export default async function SettingsPage() {
  const [profile, periods] = await Promise.all([getProfile(), getServicePeriods()]);

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">설정</h1>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">복무 정보</h2>
        <ProfileForm profile={profile} periods={periods} />
      </section>

      <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {isDemoMode() ? (
          <p className="text-sm text-zinc-500">데모 모드에서는 로그아웃이 없어요.</p>
        ) : (
          <form action={signOut}>
            <button type="submit" className="h-12 w-full rounded-xl border border-zinc-300 font-semibold dark:border-zinc-700">
              로그아웃
            </button>
          </form>
        )}
        <p className="mt-4 text-xs text-zinc-500">회원 탈퇴는 4주차에 추가돼요.</p>
      </section>
    </main>
  );
}
