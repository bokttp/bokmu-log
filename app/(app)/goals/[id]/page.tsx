import Link from "next/link";
import { notFound } from "next/navigation";
import { getGoal } from "@/lib/data";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";
import GoalStatusButtons from "@/components/goal-status-buttons";

export const instant = false; // layout.tsx 참고

export default async function GoalDetailPage({ params }: PageProps<"/goals/[id]">) {
  const { id } = await params;
  const result = await getGoal(id);
  if (!result) notFound();
  const { goal, records } = result;
  const totalMinutes = records.reduce((sum, r) => sum + (r.minutes ?? 0), 0);

  return (
    <main className="flex flex-col gap-6">
      <Link href="/goals" className="text-sm text-zinc-500 hover:underline">
        ← 목표 목록
      </Link>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        {/* 왼쪽: 목표 정보와 상태 변경 */}
        <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 p-5 lg:sticky lg:top-24 dark:border-zinc-800">
          <header>
            <p className="text-sm text-zinc-500">
              {CATEGORY_LABELS[goal.category]} · {STATUS_LABELS[goal.status]}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{goal.title}</h1>
            {goal.memo && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{goal.memo}</p>}
          </header>

          <dl className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-zinc-50 py-3 dark:bg-zinc-900">
              <dt className="text-xs text-zinc-500">목표일</dt>
              <dd className="mt-1 text-sm font-semibold">{goal.target_date?.slice(2).replaceAll("-", ".") ?? "-"}</dd>
            </div>
            <div className="rounded-xl bg-zinc-50 py-3 dark:bg-zinc-900">
              <dt className="text-xs text-zinc-500">기록</dt>
              <dd className="mt-1 text-sm font-semibold">{records.length}건</dd>
            </div>
            <div className="rounded-xl bg-zinc-50 py-3 dark:bg-zinc-900">
              <dt className="text-xs text-zinc-500">총 시간</dt>
              <dd className="mt-1 text-sm font-semibold">{Math.round((totalMinutes / 60) * 10) / 10}시간</dd>
            </div>
          </dl>

          <GoalStatusButtons id={goal.id} status={goal.status} />

          <Link
            href={`/records/new?goal=${goal.id}`}
            className="flex h-12 items-center justify-center rounded-xl border border-emerald-700 font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            이 목표에 기록하기
          </Link>
        </section>

        {/* 오른쪽: 기록 목록 */}
        <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-2 font-semibold">기록</h2>
          {records.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">아직 기록이 없어요.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-500">
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-2 pr-4 font-medium">날짜</th>
                  <th className="py-2 pr-4 font-medium">한 일</th>
                  <th className="py-2 text-right font-medium">시간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 pr-4 whitespace-nowrap text-zinc-500">{r.date.replaceAll("-", ".")}</td>
                    <td className="py-3 pr-4">{r.content}</td>
                    <td className="py-3 text-right whitespace-nowrap text-zinc-500">{r.minutes ? `${r.minutes}분` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
