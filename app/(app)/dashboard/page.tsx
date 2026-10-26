import Link from "next/link";
import { connection } from "next/server";
import { addDays, format, parseISO, startOfWeek, subWeeks } from "date-fns";
import { getGoals, getProfile, getRecordsSince } from "@/lib/data";
import { formatDday, rankStatus, serviceProgress, todayKST } from "@/lib/service";
import { BRANCH_LABELS } from "@/lib/types";
import GoalCard from "@/components/goal-card";
import RecordGrass from "@/components/record-grass";

// 12주 잔디 칸: 이번 주 월요일에서 11주 전 월요일부터 오늘이 있는 주 일요일까지
function grassWeeks(today: string) {
  const start = subWeeks(startOfWeek(parseISO(today), { weekStartsOn: 1 }), 11);
  return Array.from({ length: 12 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = format(addDays(start, w * 7 + d), "yyyy-MM-dd");
      return { date, future: date > today };
    }),
  );
}

// 매 요청 사용자 데이터를 읽는 화면이라 "즉시 이동" 검사에서 제외 (layout.tsx 참고)
export const instant = false;

export default async function DashboardPage() {
  await connection(); // 오늘 날짜로 계산하는 화면이라 요청 시점에 그린다
  const weeks = grassWeeks(todayKST());
  const [profile, goals, records] = await Promise.all([
    getProfile(),
    getGoals(),
    getRecordsSince(weeks[0][0].date),
  ]);
  const today = todayKST();
  const month = today.slice(0, 7);

  const monthRecords = records.filter((r) => r.date.startsWith(month));
  const monthMinutes = monthRecords.reduce((sum, r) => sum + (r.minutes ?? 0), 0);
  const monthDone = goals.filter((g) => g.status === "done" && g.completed_at?.startsWith(month)).length;
  const activeGoals = goals.filter((g) => g.status === "in_progress");

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        {profile?.nickname ? `${profile.nickname}님, 오늘도 한 걸음` : "홈"}
      </h1>

      {/* 전역 카드 (F-03) */}
      {profile?.enlist_date && profile.discharge_date ? (
        <ServiceCard
          enlist={profile.enlist_date}
          discharge={profile.discharge_date}
          branchLabel={profile.branch ? BRANCH_LABELS[profile.branch] : ""}
          showRank={profile.branch !== "social"}
          today={today}
        />
      ) : (
        <Link href="/settings" className="rounded-2xl border border-dashed border-zinc-300 p-5 text-center text-sm dark:border-zinc-700">
          입대일을 입력하면 전역 D-day가 보여요 →
        </Link>
      )}

      {/* 이번 달 요약 */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-500">{Number(month.slice(5))}월 요약</h2>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label="기록" value={`${monthRecords.length}건`} />
          <Stat label="총 시간" value={`${Math.round((monthMinutes / 60) * 10) / 10}시간`} />
          <Stat label="완료 목표" value={`${monthDone}개`} />
        </dl>
      </section>

      {/* 기록 잔디 */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-500">최근 12주 기록</h2>
        <RecordGrass weeks={weeks} records={records} />
      </section>

      {/* 진행 중 목표 3개 */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-500">진행 중인 목표</h2>
          <Link href="/goals" className="text-sm text-emerald-700 dark:text-emerald-400">
            전체 보기
          </Link>
        </div>
        {activeGoals.length === 0 ? (
          <Link href="/goals" className="block rounded-2xl border border-dashed border-zinc-300 p-5 text-center text-sm dark:border-zinc-700">
            첫 목표 만들기 →
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            {activeGoals.slice(0, 3).map((g) => (
              <GoalCard key={g.id} goal={g} today={today} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ServiceCard({
  enlist,
  discharge,
  branchLabel,
  showRank,
  today,
}: {
  enlist: string;
  discharge: string;
  branchLabel: string;
  showRank: boolean;
  today: string;
}) {
  const { percent, dday } = serviceProgress(enlist, discharge, today);
  const rank = rankStatus(enlist, today);

  return (
    <section className="rounded-2xl bg-emerald-800 p-5 text-white">
      <p className="text-sm text-emerald-100">
        {branchLabel} · 전역 {discharge.replaceAll("-", ".")}
      </p>
      <p className="mt-1 text-4xl font-bold tracking-tight">{formatDday(dday)}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-950/50" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span>복무율 {percent}%</span>
        {showRank && (
          <span className="text-emerald-100">
            {rank.current}
            {rank.next && ` · ${rank.next.rank} ${rank.next.date.slice(5).replace("-", ".")} (예상)`}
          </span>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 py-3 dark:bg-zinc-900">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
