import Link from "next/link";
import { notFound } from "next/navigation";
import { getCertificate, getCertificates, getSubjects } from "@/lib/data";
import { deleteCertificate } from "@/lib/actions";
import { todayKST } from "@/lib/service";
import { hours, recordTargets } from "@/lib/study";
import { CERT_KIND_LABELS, CERT_STATUS_LABELS } from "@/lib/types";
import CertStatusForm from "@/components/cert-status-form";
import CertExams from "@/components/cert-exams";
import RecordForm from "@/components/record-form";
import RecordItem from "@/components/record-item";
import AddPanel from "@/components/add-panel";
import DeleteRowButton from "@/components/delete-row-button";
import { Panel } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

// 자격증 상세: 왼쪽 정보·상태·시험 단계, 오른쪽 이 자격증의 공부 기록
export default async function CertificateDetailPage({ params }: PageProps<"/certificates/[id]">) {
  const { id } = await params;
  const [result, certificates, subjects] = await Promise.all([getCertificate(id), getCertificates(), getSubjects()]);
  if (!result) notFound();
  const { certificate: cert, records } = result;
  const today = todayKST();
  const targets = recordTargets(subjects, certificates);
  const studyDays = new Set(records.map((r) => r.date)).size;

  return (
    <main className="flex flex-col gap-6">
      <Link href="/certificates" className="text-sm text-sand-500 hover:underline">
        ← 자격증 목록
      </Link>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <section className="flex flex-col gap-5 rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
            <header>
              <p className="flex flex-wrap items-center gap-2 text-sm text-sand-500">
                <span className="rounded bg-khaki-200 px-2 py-0.5 text-xs font-semibold text-army-900 dark:bg-army-800 dark:text-khaki-200">
                  {CERT_KIND_LABELS[cert.kind]}
                </span>
                {CERT_STATUS_LABELS[cert.status]}
                {cert.acquired_on && ` · ${cert.acquired_on.replaceAll("-", ".")} 취득`}
              </p>
              <h1 className="mt-2 text-2xl font-bold">{cert.name}</h1>
              {cert.issuer && <p className="mt-1 text-sm text-sand-500">시행기관 {cert.issuer}</p>}
              {cert.memo && <p className="mt-2 text-sand-600 dark:text-sand-400">{cert.memo}</p>}
            </header>

            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
                <dt className="text-xs text-sand-500">공부 시간</dt>
                <dd className="mt-1 text-sm font-semibold">{hours(cert.minutes)}</dd>
              </div>
              <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
                <dt className="text-xs text-sand-500">공부한 날</dt>
                <dd className="mt-1 text-sm font-semibold">{studyDays}일</dd>
              </div>
              <div className="rounded-xl bg-sand-50 py-3 dark:bg-sand-900">
                <dt className="text-xs text-sand-500">시험</dt>
                <dd className="mt-1 text-sm font-semibold">{cert.exams.length}회</dd>
              </div>
            </dl>

            <CertStatusForm id={cert.id} status={cert.status} today={today} />
          </section>

          <Panel title="시험 단계">
            <CertExams certificateId={cert.id} exams={cert.exams} today={today} />
          </Panel>

          <div className="flex justify-center">
            <DeleteRowButton
              id={cert.id}
              action={deleteCertificate}
              label="자격증 삭제"
              confirmText={`이 자격증을 지울까요? 시험 일정도 함께 지워지고 되돌릴 수 없어요.${records.length ? `\n공부 기록 ${records.length}건은 지워지지 않고 남아요.` : ""}`}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {cert.status === "preparing" && (
            <AddPanel label="이 자격증 공부 기록">
              <RecordForm targets={[]} fixedTarget={`c:${cert.id}`} today={today} />
            </AddPanel>
          )}
          <Panel title={`공부 기록 ${records.length}건`}>
            {records.length === 0 ? (
              <p className="py-10 text-center text-sm text-sand-500">아직 공부 기록이 없어요.</p>
            ) : (
              <ul className="divide-y divide-sand-200 text-sm dark:divide-sand-800">
                {records.map((r) => (
                  <li key={r.id} className="py-3">
                    <RecordItem record={r} targets={targets} today={today} targetName={cert.name} showTarget={false} />
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
