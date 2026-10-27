import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { formatDday } from "@/lib/service";
import { hours } from "@/lib/study";
import type { Subject } from "@/lib/types";

// 공부 과목 카드: 위에 상태 태그 + 이번 주 시간, 가운데 과목 이름, 아래 목표·누적 시간
export default function SubjectCard({ subject, today }: { subject: Subject; today: string }) {
  const dday = subject.target_date && !subject.archived ? formatDday(differenceInCalendarDays(parseISO(subject.target_date), parseISO(today))) : null;

  return (
    <Link
      href={`/study/${subject.id}`}
      className={`flex flex-col rounded-2xl border border-sand-200 bg-white/80 p-4 shadow-sm hover:bg-sand-50 dark:border-sand-800 dark:bg-sand-900/60 dark:hover:bg-sand-900 ${
        subject.archived ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="rounded bg-khaki-200 px-2 py-0.5 font-semibold text-army-900 dark:bg-army-800 dark:text-khaki-200">
          {subject.archived ? "보관" : "공부 중"}
        </span>
        <span className="font-semibold text-army-700 dark:text-army-400">이번 주 {hours(subject.week_minutes)}</span>
      </div>
      <p className="mt-2 font-semibold">{subject.name}</p>
      {(subject.target || dday) && (
        <p className="mt-1 text-sm">
          {subject.target && <span>목표 {subject.target}</span>}
          {dday && <span className="ml-2 font-semibold text-army-700 dark:text-khaki-300">{dday}</span>}
        </p>
      )}
      <p className="mt-1 text-sm text-sand-500">
        누적 {hours(subject.minutes)} · 기록 {subject.record_count}건
      </p>
    </Link>
  );
}
