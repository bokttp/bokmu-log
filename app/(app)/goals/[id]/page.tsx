import Link from "next/link";
import { notFound } from "next/navigation";
import { getGoal, getGoals } from "@/lib/data";
import { todayKST } from "@/lib/service";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";
import GoalStatusButtons from "@/components/goal-status-buttons";
import GoalDeleteButton from "@/components/goal-delete-button";
import RecordItem from "@/components/record-item";
import GoalExamForm from "@/components/goal-exam-form";

export const instant = false; // layout.tsx 참고

export default async function GoalDetailPage({ params }: PageProps<"/goals/[id]">) {
  const { id } = await params;
  const [result, goals] = await Promise.all([getGoal(id), getGoals()]);
  if (!result) notFound();
  const { goal, records } = result;
  const today = todayKST();
  const totalMinutes = records.reduce((sum, r) => sum + (r.minutes ?? 0), 0);

  return (
    <main className="flex flex-col gap-6">
      <Link href="/goals" className="text-sm text-sand-500 hover:underline">
        ← 목표 목록
      </Link>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        {/* 왼쪽: 목표 정보와 상태 변경 */}
        <section className="flex flex-col gap-5 rounded-2xl border border-sand-200 bg-white/80 shadow-sm dark:bg-sand-900/60 p-5 lg:sticky lg:top-24 dark:border-sand-800">
          <header>
            <p className="text-sm text-sand-500">
              {CATEGORY_LABELS[goal.category]} · {STATUS_LABELS[goal.status]}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{goal.title}</h1>
            {goal.memo && <p className="mt-2 text-sand-600 dark:text-sand-400">{goal.memo}</p>}
          </header>

          <dl className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
              <dt className="text-xs text-sand-500">목표일</dt>
              <dd className="mt-1 text-sm font-semibold">{goal.target_date?.slice(2).replaceAll("-", ".") ?? "-"}</dd>
            </div>
            <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
              <dt className="text-xs text-sand-500">기록</dt>
              <dd className="mt-1 text-sm font-semibold">{records.length}건</dd>
            </div>
            <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
              <dt className="text-xs text-sand-500">총 시간</dt>
              <dd className="mt-1 text-sm font-semibold">{Math.round((totalMinutes / 60) * 10) / 10}시간</dd>
            </div>
          </dl>

          {goal.category === "certificate" && <GoalExamForm goal={goal} />}

          <GoalStatusButtons id={goal.id} status={goal.status} />

          <Link
            href={`/records/new?goal=${goal.id}`}
            className="flex h-12 items-center justify-center rounded-xl border border-army-700 font-semibold text-army-700 hover:bg-army-50 dark:border-army-400 dark:text-army-400 dark:hover:bg-army-950"
          >
            이 목표에 기록하기
          </Link>

          <div className="border-t border-sand-200 pt-3 dark:border-sand-800">
            <GoalDeleteButton id={goal.id} recordCount={records.length} />
          </div>
        </section>

        {/* 오른쪽: 기록 목록 (수정·삭제) */}
        <section className="rounded-2xl border border-sand-200 bg-white/80 shadow-sm dark:bg-sand-900/60 p-5 dark:border-sand-800">
          <h2 className="mb-2 font-semibold">기록</h2>
          {records.length === 0 ? (
            <p className="py-10 text-center text-sm text-sand-500">아직 기록이 없어요.</p>
          ) : (
            <ul className="divide-y divide-sand-200 text-sm dark:divide-sand-800">
              {records.map((r) => (
                <li key={r.id} className="py-3">
                  <RecordItem record={r} goals={goals} today={today} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
