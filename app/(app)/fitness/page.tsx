import { connection } from "next/server";
import { getFitnessTests } from "@/lib/data";
import { deleteFitnessTest } from "@/lib/actions";
import { todayKST } from "@/lib/service";
import { formatRun } from "@/lib/fitness";
import FitnessChart from "@/components/fitness-chart";
import FitnessForm from "@/components/fitness-form";
import DeleteRowButton from "@/components/delete-row-button";

export const instant = false; // layout.tsx 참고

// 체력검정 기록 (F-09): 위에 종목별 그래프, 아래에 기록표와 추가 폼
export default async function FitnessPage() {
  await connection();
  const tests = await getFitnessTests();
  const today = todayKST();

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">체력검정</h1>
        <p className="mt-1 text-sm text-sand-500">기록 {tests.length}회</p>
      </header>

      <FitnessChart tests={tests} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <section className="rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
          <h2 className="mb-2 font-semibold">기록</h2>
          {tests.length === 0 ? (
            <p className="py-12 text-center text-sm text-sand-500">아직 기록이 없어요. 검정을 보면 결과를 적어 보세요.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead className="text-left text-xs text-sand-500">
                  <tr>
                    <th className="py-2 font-medium">검정일</th>
                    <th className="py-2 font-medium">팔굽혀펴기</th>
                    <th className="py-2 font-medium">윗몸일으키기</th>
                    <th className="py-2 font-medium">3km</th>
                    <th className="py-2"><span className="sr-only">삭제</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 dark:divide-sand-800">
                  {[...tests].reverse().map((t) => (
                    <tr key={t.id}>
                      <td className="py-2">{t.tested_on.replaceAll("-", ".")}</td>
                      <td className="py-2">{t.pushups ?? "-"}{t.pushups !== null && "회"}</td>
                      <td className="py-2">{t.situps ?? "-"}{t.situps !== null && "회"}</td>
                      <td className="py-2">{t.run_seconds !== null ? formatRun(t.run_seconds) : "-"}</td>
                      <td className="py-1 text-right">
                        <DeleteRowButton id={t.id} action={deleteFitnessTest} confirmText="이 체력검정 기록을 지울까요? 되돌릴 수 없어요." />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="order-first lg:sticky lg:top-24 lg:order-none">
          <FitnessForm today={today} />
        </aside>
      </div>
    </main>
  );
}
