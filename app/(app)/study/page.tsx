import { connection } from "next/server";
import { format, parseISO, subDays } from "date-fns";
import { getCertificates, getRecordsSince, getSubjects } from "@/lib/data";
import { todayKST } from "@/lib/service";
import { hours, recordTargets, studyStreak, targetName, weekStartOf } from "@/lib/study";
import SubjectCard from "@/components/subject-card";
import SubjectForm from "@/components/subject-form";
import RecordForm from "@/components/record-form";
import RecordItem from "@/components/record-item";
import AddPanel from "@/components/add-panel";
import { EmptyState, PageHeader, Panel, TwoColumn } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

// 공부: 요약 3칸(이번 주·이번 달·연속), 왼쪽 과목 카드·이번 주 과목별 시간·최근 기록, 오른쪽 기록 추가 + 과목 추가
// 자격증 공부 기록도 여기에 함께 쌓인다.
export default async function StudyPage() {
  await connection();
  const today = todayKST();
  const since = format(subDays(parseISO(today), 83), "yyyy-MM-dd");
  const [subjects, certificates, records] = await Promise.all([getSubjects(), getCertificates(), getRecordsSince(since)]);
  const studyRecords = records.filter((r) => r.subject_id || r.certificate_id);
  const weekStart = weekStartOf(today);
  const sum = (list: typeof studyRecords) => list.reduce((t, r) => t + (r.minutes ?? 0), 0);
  const week = studyRecords.filter((r) => r.date >= weekStart);
  const month = studyRecords.filter((r) => r.date.startsWith(today.slice(0, 7)));
  const targets = recordTargets(subjects, certificates);
  const nameOf = (r: (typeof studyRecords)[number]) => targetName(r, subjects, certificates);

  // 이번 주 과목·자격증별 시간 (많은 순)
  const byTarget = new Map<string, number>();
  for (const r of week) {
    const name = nameOf(r) ?? "기타";
    byTarget.set(name, (byTarget.get(name) ?? 0) + (r.minutes ?? 0));
  }
  const weekBars = [...byTarget.entries()].sort((a, b) => b[1] - a[1]);
  const maxBar = Math.max(1, ...weekBars.map(([, m]) => m));

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="공부"
        description="과목별로 공부한 내용과 시간을 남겨요. 자격증 공부도 함께 모여요."
        stats={[
          { label: "이번 주", value: hours(sum(week)) },
          { label: `${Number(today.slice(5, 7))}월`, value: hours(sum(month)) },
          { label: "연속 공부", value: `${studyStreak(studyRecords.map((r) => r.date), today)}일` },
        ]}
      />

      <TwoColumn
        aside={
          <>
            <AddPanel label="공부 기록 추가">
              <RecordForm targets={targets} today={today} />
            </AddPanel>
            <AddPanel label="과목 추가" variant="outline">
              <SubjectForm />
            </AddPanel>
          </>
        }
      >
        {subjects.length === 0 ? (
          <EmptyState>아직 과목이 없어요. 공부할 과목을 추가해 보세요.</EmptyState>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {subjects.map((s) => (
              <SubjectCard key={s.id} subject={s} today={today} />
            ))}
          </div>
        )}

        <Panel title="이번 주 공부 시간">
          {weekBars.length === 0 ? (
            <p className="text-sm text-sand-500">이번 주 공부 기록이 아직 없어요.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {weekBars.map(([name, minutes]) => (
                <li key={name} className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-3">
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
