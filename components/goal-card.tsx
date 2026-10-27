import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { formatDday } from "@/lib/service";
import { CATEGORY_LABELS, EXAM_RESULT_LABELS, STATUS_LABELS, type Goal } from "@/lib/types";

export default function GoalCard({ goal, today }: { goal: Goal; today: string }) {
  const dday =
    goal.target_date && goal.status === "in_progress"
      ? formatDday(differenceInCalendarDays(parseISO(goal.target_date), parseISO(today)))
      : null;
  // 자격증 시험 (F-07): 결과가 나왔으면 결과, 아니면 시험일 D-day
  const exam =
    goal.category !== "certificate" || !goal.exam_date
      ? null
      : goal.exam_result === "pass" || goal.exam_result === "fail"
        ? { text: EXAM_RESULT_LABELS[goal.exam_result], strong: goal.exam_result === "pass" }
        : { text: `시험 ${formatDday(differenceInCalendarDays(parseISO(goal.exam_date), parseISO(today)))}`, strong: true };

  return (
    <Link
      href={`/goals/${goal.id}`}
      className={`block rounded-2xl border border-sand-200 bg-white/80 shadow-sm dark:bg-sand-900/60 p-4 hover:bg-sand-50 dark:border-sand-800 dark:hover:bg-sand-900 ${
        goal.status === "in_progress" ? "" : "opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="rounded bg-khaki-200 px-2 py-0.5 font-semibold text-army-900 dark:bg-army-800 dark:text-khaki-200">
          {CATEGORY_LABELS[goal.category]}
        </span>
        <span className="font-semibold text-army-700 dark:text-army-400">
          {dday ?? STATUS_LABELS[goal.status]}
        </span>
      </div>
      <p className="mt-2 font-semibold">{goal.title}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-sand-500">
        기록 {goal.record_count}건
        {exam && <span className={exam.strong ? "font-semibold text-army-700 dark:text-khaki-300" : ""}>· {exam.text}</span>}
      </p>
    </Link>
  );
}
