import Link from "next/link";
import { connection } from "next/server";
import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek, subWeeks } from "date-fns";
import { getCertificates, getProfile, getRecordsSince } from "@/lib/data";
import { formatDday, rankStatus, serviceProgress, todayKST } from "@/lib/service";
import { hours, nextExam, recordTargets, studyStreak, targetName, weekStartOf } from "@/lib/study";
import { BRANCH_LABELS, EXAM_STAGE_LABELS } from "@/lib/types";
import CertificateCard from "@/components/certificate-card";
import RecordGrass from "@/components/record-grass";
import RankBadge from "@/components/rank-badge";
import { Panel } from "@/components/page-frame";

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
  const [profile, certificates, records] = await Promise.all([
    getProfile(),
    getCertificates(),
    getRecordsSince(weeks[0][0].date),
  ]);
  const today = todayKST();
  const month = today.slice(0, 7);

  const monthRecords = records.filter((r) => r.date.startsWith(month));
  const monthMinutes = monthRecords.reduce((sum, r) => sum + (r.minutes ?? 0), 0);
  const acquired = certificates.filter((c) => c.status === "acquired").length;
  const preparing = certificates.filter((c) => c.status === "preparing");
  const targets = recordTargets(certificates);
  const names = Object.fromEntries(records.map((r) => [r.id, targetName(r, certificates) ?? ""]));
  const week = records.filter((r) => r.date >= weekStartOf(today));
  const weekMinutes = week.reduce((sum, r) => sum + (r.minutes ?? 0), 0);
  const streak = studyStreak(records.map((r) => r.date), today);
  // 준비 중인 자격증 중 가장 가까운 시험
  const next = preparing
    .map((cert) => ({ cert, exam: nextExam(cert.exams, today) }))
    .filter((u): u is { cert: (typeof preparing)[number]; exam: NonNullable<ReturnType<typeof nextExam>> } => Boolean(u.exam?.exam_date))
    .sort((a, b) => (a.exam.exam_date ?? "").localeCompare(b.exam.exam_date ?? ""))[0];

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">
          {profile?.nickname ? `${profile.nickname}님, 오늘도 한 걸음` : "홈"}
        </h1>
        <p className="mt-1 text-sm text-sand-500">{today.replaceAll("-", ".")} 기준</p>
      </header>

      {/* 넓은 화면: 3열 그리드 (왼쪽 2칸 + 오른쪽 1칸) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 전역 카드 (F-03) */}
        <div className="lg:col-span-2">
          {profile?.enlist_date && profile.discharge_date ? (
            <ServiceCard
              enlist={profile.enlist_date}
              discharge={profile.discharge_date}
              branchLabel={profile.branch ? BRANCH_LABELS[profile.branch] : ""}
              showRank={profile.branch !== "social"}
              today={today}
            />
          ) : (
            <Link href="/settings" className="flex h-full items-center justify-center rounded-2xl border border-dashed border-sand-300 p-5 text-center text-sm dark:border-sand-700">
              입대일을 입력하면 전역 D-day가 보여요 →
            </Link>
          )}
        </div>

        {/* 이번 주: 다음 시험 D-day + 공부 요약 */}
        <Panel title="이번 주">
          <div className="flex flex-col gap-3">
            {next ? (
              <Link
                href={`/certificates/${next.cert.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-army-800 px-4 py-3 text-khaki-100 hover:bg-army-700 dark:bg-army-900"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-khaki-300">다음 시험</span>
                  <span className="block truncate font-semibold">{next.cert.name}</span>
                  <span className="text-xs text-khaki-200">
                    {EXAM_STAGE_LABELS[next.exam.stage]} · {next.exam.exam_date!.replaceAll("-", ".")}
                  </span>
                </span>
                <span className="shrink-0 font-stencil text-3xl tracking-wide">
                  {formatDday(differenceInCalendarDays(parseISO(next.exam.exam_date!), parseISO(today)))}
                </span>
              </Link>
            ) : (
              <Link href="/certificates" className="block rounded-xl border border-dashed border-sand-300 p-4 text-center text-sm dark:border-sand-700">
                시험 일정을 넣으면 D-day가 보여요 →
              </Link>
            )}
            <dl className="grid grid-cols-3 gap-2 text-center lg:grid-cols-1 lg:text-left">
              <Stat label="이번 주 공부" value={hours(weekMinutes)} sub={`연속 ${streak}일`} />
              <Stat label={`${Number(month.slice(5))}월 기록`} value={`${monthRecords.length}건`} sub={hours(monthMinutes)} />
              <Stat label="취득 자격증" value={`${acquired}개`} />
            </dl>
          </div>
        </Panel>

        {/* 기록 잔디 */}
        <Panel title="최근 12주 기록" className="lg:col-span-2">
          <RecordGrass
            weeks={weeks}
            records={records}
            targets={targets}
            names={names}
            today={today}
          />
        </Panel>

        {/* 준비 중인 자격증 3개 (다가오는 시험 순) */}
        <Panel
          title="준비 중인 자격증"
          action={
            <Link href="/certificates" className="text-sm text-army-700 hover:underline dark:text-army-400">
              전체 보기
            </Link>
          }
        >
          {preparing.length === 0 ? (
            <Link href="/certificates" className="block rounded-xl border border-dashed border-sand-300 p-5 text-center text-sm dark:border-sand-700">
              준비할 자격증 추가하기 →
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              {preparing.slice(0, 3).map((c) => (
                <CertificateCard key={c.id} cert={c} today={today} />
              ))}
            </div>
          )}
        </Panel>
      </div>
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
    <section className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-army-800 p-5 text-khaki-100 shadow-md md:p-8">
      {/* 위장 무늬 */}
      <div className="camo pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-khaki-200">
            <span className="rounded bg-khaki-300 px-1.5 py-0.5 text-xs font-bold text-army-900">{branchLabel}</span>
            전역까지
          </p>
          <p className="mt-2 font-stencil text-6xl tracking-wide text-khaki-100 md:text-7xl">{formatDday(dday)}</p>
        </div>
        {showRank && (
          <div className="flex flex-col items-center gap-1">
            <RankBadge rank={rank.current} className="h-auto w-12 md:w-14" />
            <span className="text-xs font-semibold text-khaki-200">{rank.current}</span>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-khaki-200">복무율</span>
          <span className="font-stencil text-2xl text-khaki-100 md:text-3xl">{percent}%</span>
        </div>
        {/* 10칸 눈금이 있는 진행 막대 */}
        <div
          className="relative h-4 overflow-hidden rounded bg-army-950/60 ring-1 ring-khaki-300/30"
          role="progressbar"
          aria-label="복무율"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-khaki-300" style={{ width: `${percent}%` }} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 calc(10% - 2px), rgba(26,29,12,0.55) calc(10% - 2px) 10%)" }}
            aria-hidden
          />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
          <div>
            <dt className="text-khaki-300">입대일</dt>
            <dd className="font-semibold">{enlist.replaceAll("-", ".")}</dd>
          </div>
          <div>
            <dt className="text-khaki-300">전역일</dt>
            <dd className="font-semibold">{discharge.replaceAll("-", ".")}</dd>
          </div>
          {showRank && rank.next && (
            <div>
              <dt className="text-khaki-300">다음 진급 (예상)</dt>
              <dd className="font-semibold">
                {rank.next.rank} · {rank.next.date.slice(5).replace("-", ".")}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-sand-200 bg-sand-100/70 py-3 lg:flex lg:items-center lg:justify-between lg:px-4 lg:py-3 dark:border-sand-800 dark:bg-sand-900">
      <dt className="text-xs text-sand-600 lg:text-sm dark:text-sand-400">{label}</dt>
      <dd className="mt-1 lg:mt-0 lg:text-right">
        <span className="font-bold text-army-800 lg:text-xl dark:text-khaki-200">{value}</span>
        {sub && <span className="block text-xs text-sand-500">{sub}</span>}
      </dd>
    </div>
  );
}
