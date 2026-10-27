import Link from "next/link";
import { notFound } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { getCertificates, getSubject, getSubjects } from "@/lib/data";
import { deleteSubject } from "@/lib/actions";
import { formatDday, todayKST } from "@/lib/service";
import { hours, recordTargets } from "@/lib/study";
import SubjectArchiveButton from "@/components/subject-archive-button";
import RecordForm from "@/components/record-form";
import RecordItem from "@/components/record-item";
import AddPanel from "@/components/add-panel";
import DeleteRowButton from "@/components/delete-row-button";
import { Panel } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

// 과목 상세: 왼쪽 과목 정보·보관·삭제, 오른쪽 이 과목의 공부 기록
export default async function SubjectDetailPage({ params }: PageProps<"/study/[id]">) {
  const { id } = await params;
  const [result, subjects, certificates] = await Promise.all([getSubject(id), getSubjects(), getCertificates()]);
  if (!result) notFound();
  const { subject, records } = result;
  const today = todayKST();
  const targets = recordTargets(subjects, certificates);
  const dday = subject.target_date ? formatDday(differenceInCalendarDays(parseISO(subject.target_date), parseISO(today))) : null;

  return (
    <main className="flex flex-col gap-6">
      <Link href="/study" className="text-sm text-sand-500 hover:underline">
        ← 공부 목록
      </Link>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <section className="flex flex-col gap-5 rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
            <header>
              <p className="text-sm text-sand-500">{subject.archived ? "보관한 과목" : "공부 중"}</p>
              <h1 className="mt-1 text-2xl font-bold">{subject.name}</h1>
              {(subject.target || subject.target_date) && (
                <p className="mt-2">
                  {subject.target && <>목표 {subject.target}</>}
                  {subject.target_date && (
                    <span className="ml-2 text-sm text-sand-500">
                      {subject.target_date.replaceAll("-", ".")}
                      {dday && !subject.archived && <span className="ml-1 font-semibold text-army-700 dark:text-khaki-300">{dday}</span>}
                    </span>
                  )}
                </p>
              )}
            </header>

            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
                <dt className="text-xs text-sand-500">이번 주</dt>
                <dd className="mt-1 text-sm font-semibold">{hours(subject.week_minutes)}</dd>
              </div>
              <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
                <dt className="text-xs text-sand-500">누적</dt>
                <dd className="mt-1 text-sm font-semibold">{hours(subject.minutes)}</dd>
              </div>
              <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
                <dt className="text-xs text-sand-500">기록</dt>
                <dd className="mt-1 text-sm font-semibold">{subject.record_count}건</dd>
              </div>
            </dl>

            <SubjectArchiveButton id={subject.id} archived={subject.archived} />
          </section>

          <div className="flex justify-center">
            <DeleteRowButton
              id={subject.id}
              action={deleteSubject}
              label="과목 삭제"
              confirmText={`이 과목을 지울까요? 되돌릴 수 없어요.${records.length ? `\n공부 기록 ${records.length}건은 지워지지 않고 남아요.` : ""}`}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {!subject.archived && (
            <AddPanel label="이 과목 공부 기록">
              <RecordForm targets={[]} fixedTarget={`s:${subject.id}`} today={today} />
            </AddPanel>
          )}
          <Panel title={`공부 기록 ${records.length}건`}>
            {records.length === 0 ? (
              <p className="py-10 text-center text-sm text-sand-500">아직 공부 기록이 없어요.</p>
            ) : (
              <ul className="divide-y divide-sand-200 text-sm dark:divide-sand-800">
                {records.map((r) => (
                  <li key={r.id} className="py-3">
                    <RecordItem record={r} targets={targets} today={today} targetName={subject.name} showTarget={false} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
