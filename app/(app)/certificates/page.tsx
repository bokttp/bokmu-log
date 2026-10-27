import { connection } from "next/server";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { getCertificates } from "@/lib/data";
import { formatDday, todayKST } from "@/lib/service";
import { nextExam } from "@/lib/study";
import { EXAM_STAGE_LABELS } from "@/lib/types";
import CertificateCard from "@/components/certificate-card";
import CertificateForm from "@/components/certificate-form";
import AddPanel from "@/components/add-panel";
import { EmptyState, PageHeader, Panel, TwoColumn } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

// 자격증 (F-07 확장): 요약 3칸, 왼쪽 자격증 카드(준비 중 → 취득 → 포기), 오른쪽 추가 + 다가오는 시험
export default async function CertificatesPage() {
  await connection();
  const certs = await getCertificates();
  const today = todayKST();
  const preparing = certs.filter((c) => c.status === "preparing");
  const acquired = certs.filter((c) => c.status === "acquired");
  // 준비 중인 자격증의 다가오는 시험, 가까운 순
  const upcoming = preparing
    .map((c) => ({ cert: c, exam: nextExam(c.exams, today) }))
    .filter((u) => u.exam?.exam_date)
    .sort((a, b) => (a.exam!.exam_date ?? "").localeCompare(b.exam!.exam_date ?? ""));
  const dday = (date: string) => formatDday(differenceInCalendarDays(parseISO(date), parseISO(today)));

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="자격증"
        description="준비 중인 자격증의 시험 일정과 결과, 공부 시간을 관리해요."
        stats={[
          { label: "준비 중", value: `${preparing.length}개` },
          { label: "취득", value: `${acquired.length}개` },
          { label: "다음 시험", value: upcoming[0] ? dday(upcoming[0].exam!.exam_date!) : "-" },
        ]}
      />

      <TwoColumn
        aside={
          <>
            <AddPanel label="자격증 추가">
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
      </TwoColumn>
    </main>
  );
}
