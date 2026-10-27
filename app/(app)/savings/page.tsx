import { connection } from "next/server";
import { differenceInCalendarMonths, parseISO } from "date-fns";
import { getProfile, getSavingsSettings } from "@/lib/data";
import { todayKST } from "@/lib/service";
import SavingsCalculator from "@/components/savings-calculator";

export const instant = false; // layout.tsx 참고

// 적금 계산기 (F-10, 명세 7.4). 기간 기본값은 전역까지 남은 개월 수.
export default async function SavingsPage() {
  await connection();
  const [settings, profile] = await Promise.all([getSavingsSettings(), getProfile()]);
  const left = profile?.discharge_date ? differenceInCalendarMonths(parseISO(profile.discharge_date), parseISO(todayKST())) : 18;

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">적금 계산기</h1>
        <p className="mt-1 text-sm text-sand-500">장병내일준비적금의 만기 금액을 미리 계산해 봐요. 입력한 값은 저장되지 않아요.</p>
      </header>

      {settings ? (
        <SavingsCalculator settings={settings} defaultMonths={Math.min(settings.max_months, Math.max(1, left))} />
      ) : (
        <p className="rounded-2xl border border-dashed border-sand-300 py-16 text-center text-sm text-sand-500 dark:border-sand-700">
          계산에 필요한 정책 값을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      <p className="text-sm text-sand-500">
        예상 금액입니다. 정확한 금액은 가입 은행에서 확인하세요. 이자는 매달 같은 금액을 넣는 단리로 계산했고, 은행별 우대 금리는 넣지 않았어요.
      </p>
    </main>
  );
}
