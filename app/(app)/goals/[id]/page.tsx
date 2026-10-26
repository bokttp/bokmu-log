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
    <main className="flex flex-col gap-5">
      <Link href="/goals" className="text-sm text-zinc-500">
        ← 목표 목록
      </Link>

      <header>
        <p className="text-sm text-zinc-500">
          {CATEGORY_LABELS[goal.category]} · {STATUS_LABELS[goal.status]}
          {goal.target_date && ` · 목표일 ${goal.target_date.replaceAll("-", ".")}`}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{goal.title}</h1>
        {goal.memo && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{goal.memo}</p>}
        <p className="mt-2 text-sm text-zinc-500">
          기록 {records.length}건 · 총 {Math.round((totalMinutes / 60) * 10) / 10}시간
        </p>
      </header>

      <GoalStatusButtons id={goal.id} status={goal.status} />

      <Link
        href={`/records/new?goal=${goal.id}`}
        className="flex h-12 items-center justify-center rounded-xl border border-emerald-700 font-semibold text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
      >
        이 목표에 기록하기
      </Link>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-500">기록</h2>
        {records.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">아직 기록이 없어요.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {records.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p>{r.content}</p>
                  <p className="text-xs text-zinc-500">{r.date.replaceAll("-", ".")}</p>
                </div>
                {r.minutes && <span className="shrink-0 text-sm text-zinc-500">{r.minutes}분</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
