import { connection } from "next/server";
import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import { getCertificates, getRecordsSince } from "@/lib/data";
import { formatDday, todayKST } from "@/lib/service";
import { hours, nextExam, recordTargets, studyStreak, targetName, weekStartOf } from "@/lib/study";
import { EXAM_STAGE_LABELS } from "@/lib/types";
import CertificateCard from "@/components/certificate-card";
import CertificateForm from "@/components/certificate-form";
import RecordForm from "@/components/record-form";
import RecordItem from "@/components/record-item";
import AddPanel from "@/components/add-panel";
import { EmptyState, PageHeader, Panel, TwoColumn } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

// 자격증 (F-04): 요약 3칸, 왼쪽 자격증 카드·이번 주 공부 시간·최근 공부 기록,
// 오른쪽 공부 기록 추가·자격증 추가·다가오는 시험
export default async function CertificatesPage() {
  await connection();
  const today = todayKST();
  const since = format(subDays(parseISO(today), 83), "yyyy-MM-dd");
  const [certs, records] = await Promise.all([getCertificates(), getRecordsSince(since)]);
  const preparing = certs.filter((c) => c.status === "preparing");
  const studyRecords = records.filter((r) => r.certificate_id || r.subject_id);
  const week = studyRecords.filter((r) => r.date >= weekStartOf(today));
  const weekMinutes = week.reduce((t, r) => t + (r.minutes ?? 0), 0);
  const streak = studyStreak(studyRecords.map((r) => r.date), today);
  const targets = recordTargets(certs);
  const nameOf = (r: (typeof studyRecords)[number]) => targetName(r, certs);

  // 준비 중인 자격증의 다가오는 시험, 가까운 순
  const upcoming = preparing
    .map((c) => ({ cert: c, exam: nextExam(c.exams, today) }))
    .filter((u) => u.exam?.exam_date)
    .sort((a, b) => (a.exam!.exam_date ?? "").localeCompare(b.exam!.exam_date ?? ""));
  const dday = (date: string) => formatDday(differenceInCalendarDays(parseISO(date), parseISO(today)));

  // 이번 주 자격증별 공부 시간 (많은 순)
  const byCert = new Map<string, number>();
  for (const r of week) {
    const name = nameOf(r) ?? "기타";
    byCert.set(name, (byCert.get(name) ?? 0) + (r.minutes ?? 0));
  }
  const weekBars = [...byCert.entries()].sort((a, b) => b[1] - a[1]);
  const maxBar = Math.max(1, ...weekBars.map(([, m]) => m));

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="자격증"
        description="준비 중인 자격증의 시험 일정과 결과, 공부한 내용과 시간을 관리해요."
        stats={[
          { label: "준비 중", value: `${preparing.length}개` },
          { label: "취득", value: `${certs.filter((c) => c.status === "acquired").length}개` },
          { label: "이번 주 공부", value: hours(weekMinutes) },
        ]}
      />

      <TwoColumn
        aside={
          <>
            <AddPanel label="공부 기록 추가">
              <RecordForm targets={targets} today={today} />
            </AddPanel>
            <AddPanel label="자격증 추가" variant="outline">
              <CertificateForm />
            </AddPanel>
            <Panel title="다가오는 시험">
              {upcoming.length === 0 ? (
                <p className="text-sm text-sand-500">잡힌 시험 일정이 없어요.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-sand-200 text-sm dark:divide-sand-800">
                  {upcoming.map(({ cert, exam }) => (
                    <li key={exam!.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{cert.name}</span>
                        <span className="text-xs text-sand-500">
                          {EXAM_STAGE_LABELS[exam!.stage]} · {exam!.exam_date!.replaceAll("-", ".")}
                        </span>
                      </span>
                      <span className="shrink-0 font-stencil text-lg text-army-800 dark:text-khaki-200">{dday(exam!.exam_date!)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </>
        }
      >
        {certs.length === 0 ? (
          <EmptyState>아직 자격증이 없어요. 준비할 자격증을 추가해 보세요.</EmptyState>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {certs.map((c) => (
              <CertificateCard key={c.id} cert={c} today={today} />
            ))}
          </div>
        )}

        <Panel title="이번 주 공부 시간" action={<span className="text-sm text-sand-500">연속 {streak}일</span>}>
          {weekBars.length === 0 ? (
            <p className="text-sm text-sand-500">이번 주 공부 기록이 아직 없어요.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {weekBars.map(([name, minutes]) => (
                <li key={name} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3">
                  <span className="truncate">{name}</span>
                  <span className="h-3 overflow-hidden rounded bg-sand-100 dark:bg-sand-800">
                    <span className="block h-full rounded bg-army-600 dark:bg-khaki-300" style={{ width: `${(minutes / maxBar) * 100}%` }} />
                  </span>
                  <span className="w-14 text-right text-sand-600 dark:text-sand-400">{hours(minutes)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="최근 공부 기록">
          {studyRecords.length === 0 ? (
            <p className="py-8 text-center text-sm text-sand-500">아직 공부 기록이 없어요.</p>
          ) : (
            <ul className="divide-y divide-sand-200 text-sm dark:divide-sand-800">
              {studyRecords.slice(0, 15).map((r) => (
                <li key={r.id} className="py-3">
                  <RecordItem record={r} targets={targets} today={today} targetName={nameOf(r)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </TwoColumn>
    </main>
  );
}
