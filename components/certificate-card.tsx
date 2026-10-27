import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { formatDday } from "@/lib/service";
import { hours, nextExam } from "@/lib/study";
import { CERT_KIND_LABELS, CERT_STATUS_LABELS, EXAM_RESULT_LABELS, EXAM_STAGE_LABELS, type Certificate } from "@/lib/types";

// 자격증 카드: 위에 종류 태그 + 다가오는 시험 D-day(또는 상태), 가운데 이름, 아래 시험 단계와 공부 시간
export default function CertificateCard({ cert, today }: { cert: Certificate; today: string }) {
  const next = cert.status === "preparing" ? nextExam(cert.exams, today) : null;
  const badge = next?.exam_date
    ? `${EXAM_STAGE_LABELS[next.stage]} ${formatDday(differenceInCalendarDays(parseISO(next.exam_date), parseISO(today)))}`
    : CERT_STATUS_LABELS[cert.status];

  return (
    <Link
      href={`/certificates/${cert.id}`}
      className={`flex flex-col rounded-2xl border border-sand-200 bg-white/80 p-4 shadow-sm hover:bg-sand-50 dark:border-sand-800 dark:bg-sand-900/60 dark:hover:bg-sand-900 ${
        cert.status === "dropped" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="rounded bg-khaki-200 px-2 py-0.5 font-semibold text-army-900 dark:bg-army-800 dark:text-khaki-200">
          {CERT_KIND_LABELS[cert.kind]}
        </span>
        <span className={`font-semibold ${cert.status === "acquired" ? "text-army-700 dark:text-khaki-300" : "text-army-700 dark:text-army-400"}`}>
          {cert.status === "acquired" ? "★ 취득" : badge}
        </span>
      </div>
      <p className="mt-2 font-semibold">{cert.name}</p>
      {cert.exams.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {cert.exams.map((e) => (
            <li
              key={e.id}
              className={`rounded-full px-2 py-0.5 ${
                e.result === "pass"
                  ? "bg-army-700 text-white dark:bg-khaki-300 dark:text-army-900"
                  : e.result === "fail"
                    ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : "border border-sand-300 text-sand-600 dark:border-sand-700 dark:text-sand-400"
              }`}
            >
              {EXAM_STAGE_LABELS[e.stage]} {EXAM_RESULT_LABELS[e.result]}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-sm text-sand-500">
        {[cert.issuer, `공부 ${hours(cert.minutes)}`].filter(Boolean).join(" · ")}
      </p>
    </Link>
  );
}
