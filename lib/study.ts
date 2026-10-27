import { addDays, format, parseISO, startOfWeek } from "date-fns";
import type { CertExam, Certificate, RecordTarget, Subject } from "./types";

// 공부·자격증 계산 (순수 함수). 날짜는 KST "YYYY-MM-DD" 문자열.

// 이번 주 월요일
export const weekStartOf = (today: string) => format(startOfWeek(parseISO(today), { weekStartsOn: 1 }), "yyyy-MM-dd");

// 연속 공부일: 오늘(또는 어제)부터 거꾸로 하루도 빠지지 않고 기록한 날 수
export function studyStreak(dates: string[], today: string): number {
  const days = new Set(dates);
  let cursor = days.has(today) ? today : format(addDays(parseISO(today), -1), "yyyy-MM-dd");
  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = format(addDays(parseISO(cursor), -1), "yyyy-MM-dd");
  }
  return count;
}

// 다가오는 시험: 결과 대기 중이고 시험일이 오늘 이후인 것 중 가장 빠른 것
export function nextExam(exams: CertExam[], today: string): CertExam | null {
  return (
    exams
      .filter((e) => e.result === "pending" && e.exam_date && e.exam_date >= today)
      .sort((a, b) => (a.exam_date ?? "").localeCompare(b.exam_date ?? ""))[0] ?? null
  );
}

export const hours = (minutes: number) => `${Math.round((minutes / 60) * 10) / 10}시간`;

// 공부 기록을 붙일 곳: 공부 중인 과목 + 준비 중인 자격증
export function recordTargets(subjects: Subject[], certificates: Certificate[]): RecordTarget[] {
  return [
    ...subjects.filter((s) => !s.archived).map((s) => ({ key: `s:${s.id}`, name: s.name, type: "subject" as const })),
    ...certificates.filter((c) => c.status === "preparing").map((c) => ({ key: `c:${c.id}`, name: c.name, type: "certificate" as const })),
  ];
}

// 기록이 붙은 곳의 이름 (목록 표시용). 보관·취득한 곳도 이름은 보여야 하므로 전체 목록에서 찾는다.
export function targetName(record: { subject_id: string | null; certificate_id: string | null }, subjects: Pick<Subject, "id" | "name">[], certificates: Pick<Certificate, "id" | "name">[]) {
  if (record.subject_id) return subjects.find((s) => s.id === record.subject_id)?.name ?? null;
  if (record.certificate_id) return certificates.find((c) => c.id === record.certificate_id)?.name ?? null;
  return null;
}
