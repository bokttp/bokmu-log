import { getProfile, getServicePeriods } from "@/lib/data";
import { isDemoMode } from "@/lib/demo";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";
import ProfileForm from "@/components/profile-form";
import DeleteAccountForm from "@/components/delete-account-form";
import PasswordForm from "@/components/password-form";

export const instant = false; // layout.tsx 참고

export default async function SettingsPage() {
  const [profile, periods] = await Promise.all([getProfile(), getServicePeriods()]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold md:text-3xl">설정</h1>

      <section className="rounded-2xl border border-zinc-200 p-5 md:p-8 dark:border-zinc-800">
        <h2 className="mb-4 font-semibold">복무 정보</h2>
        <ProfileForm profile={profile} periods={periods} />
      </section>

      <section className="rounded-2xl border border-zinc-200 p-5 md:p-8 dark:border-zinc-800">
        <h2 className="mb-4 font-semibold">비밀번호</h2>
        <PasswordForm />
      </section>

      <section className="rounded-2xl border border-zinc-200 p-5 md:p-8 dark:border-zinc-800">
        <h2 className="mb-4 font-semibold">계정</h2>
        {isDemoMode() ? (
          <p className="text-sm text-zinc-500">데모 모드에서는 로그아웃이 없어요.</p>
        ) : (
          <form action={signOut}>
            <button type="submit" className="h-12 w-full rounded-xl border border-zinc-300 font-semibold hover:bg-zinc-50 md:w-auto md:px-8 dark:border-zinc-700 dark:hover:bg-zinc-900">
              로그아웃
            </button>
          </form>
        )}
        <p className="mt-4 text-xs text-zinc-500">
          <Link href="/privacy" className="underline">
            개인정보 처리방침
          </Link>
        </p>
      </section>

      <section className="rounded-2xl border border-red-200 p-5 md:p-8 dark:border-red-900">
        <h2 className="mb-4 font-semibold text-red-700 dark:text-red-400">회원 탈퇴</h2>
        <DeleteAccountForm />
      </section>
    </main>
  );
}
