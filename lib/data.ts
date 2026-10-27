import "server-only";
import { connection } from "next/server";
import { createClient } from "./supabase/server";
import { demoData, isDemoMode } from "./demo";
import { todayKST } from "./service";
import { nextExam, weekStartOf } from "./study";
import type {
  ActivityRecord,
  Book,
  Branch,
  CertExam,
  Certificate,
  FitnessTest,
  Profile,
  SavingsSettings,
  Subject,
} from "./types";

// 화면에서 쓰는 데이터 조회. 데모 모드면 예시 데이터, 아니면 Supabase에서 읽는다.
// RLS가 본인 행만 돌려주므로 user_id 조건은 따로 걸지 않는다.

async function demo() {
  await connection(); // 오늘 날짜를 쓰므로 요청 시점에 계산
  return demoData(todayKST());
}

const RECORD_COLUMNS = "id, subject_id, certificate_id, date, content, minutes";
const sumMinutes = (rows: { minutes: number | null }[]) => rows.reduce((t, r) => t + (r.minutes ?? 0), 0);

// 준비 중이 위, 그다음 다가오는 시험이 빠른 순
function sortCertificates(list: Certificate[], today: string) {
  const rank = { preparing: 0, acquired: 1, dropped: 2 } as const;
  const next = (c: Certificate) => nextExam(c.exams, today)?.exam_date ?? "9999";
  return [...list].sort((a, b) => rank[a.status] - rank[b.status] || next(a).localeCompare(next(b)));
}

export async function getProfile(): Promise<Profile | null> {
  if (isDemoMode()) return (await demo()).profile;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nickname, branch, enlist_date, discharge_date, onboarded")
    .single();
  return data;
}

export async function getCertificates(): Promise<Certificate[]> {
  await connection(); // 오늘 날짜로 정렬하므로 요청 시점에 계산
  const today = todayKST();
  if (isDemoMode()) return sortCertificates((await demo()).certificates, today);

  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("id, name, kind, issuer, status, acquired_on, memo, cert_exams(id, certificate_id, stage, exam_date, result, score), records(minutes)");
  const list = (data ?? []).map(({ cert_exams, records, ...c }) => ({
    ...c,
    exams: ((cert_exams ?? []) as CertExam[]).sort((a, b) => (a.exam_date ?? "9999").localeCompare(b.exam_date ?? "9999")),
    minutes: sumMinutes((records ?? []) as { minutes: number | null }[]),
    record_count: (records ?? []).length,
  })) as Certificate[];
  return sortCertificates(list, today);
}

export async function getSubjects(): Promise<Subject[]> {
  if (isDemoMode()) return (await demo()).subjects;

  await connection(); // 이번 주 계산에 오늘 날짜를 쓴다
  const weekStart = weekStartOf(todayKST());
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id, name, target, target_date, archived, records(minutes, date)")
    .order("archived")
    .order("created_at");
  return (data ?? []).map(({ records, ...s }) => {
    const rows = (records ?? []) as { minutes: number | null; date: string }[];
    return { ...s, minutes: sumMinutes(rows), week_minutes: sumMinutes(rows.filter((r) => r.date >= weekStart)), record_count: rows.length };
  }) as Subject[];
}

// 한 자격증 또는 한 과목의 공부 기록, 최신순
async function recordsOf(column: "certificate_id" | "subject_id", id: string): Promise<ActivityRecord[]> {
  if (isDemoMode()) return (await demo()).records.filter((r) => r[column] === id);

  const supabase = await createClient();
  const { data } = await supabase.from("records").select(RECORD_COLUMNS).eq(column, id).order("date", { ascending: false });
  return (data ?? []) as ActivityRecord[];
}

export async function getCertificate(id: string) {
  const certificate = (await getCertificates()).find((c) => c.id === id);
  return certificate ? { certificate, records: await recordsOf("certificate_id", id) } : null;
}

export async function getSubject(id: string) {
  const subject = (await getSubjects()).find((s) => s.id === id);
  return subject ? { subject, records: await recordsOf("subject_id", id) } : null;
}

// 독서 기록: 읽는 중(완독일 없음)이 위, 그다음 최근 완독 순 (F-08)
export async function getBooks(): Promise<Book[]> {
  if (isDemoMode()) return (await demo()).books;

  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("id, title, author, finished_on, rating, review")
    .order("finished_on", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as Book[];
}

// 체력검정 기록, 오래된 순 (그래프용) (F-09)
export async function getFitnessTests(): Promise<FitnessTest[]> {
  if (isDemoMode()) return (await demo()).fitnessTests;

  const supabase = await createClient();
  const { data } = await supabase
    .from("fitness_tests")
    .select("id, tested_on, pushups, situps, run_seconds")
    .order("tested_on", { ascending: true });
  return (data ?? []) as FitnessTest[];
}

// 적금 정책 수치 (F-10). 코드에 고정하지 않고 app_settings에서 읽는다.
export async function getSavingsSettings(): Promise<SavingsSettings | null> {
  if (isDemoMode()) return { monthly_limit: 550_000, base_rate: 0.05, match_ratio: 1, max_months: 24 };

  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", "savings").maybeSingle();
  return (data?.value as SavingsSettings | undefined) ?? null;
}

// 군종별 복무 개월 수 (전역일 자동 계산용)
export async function getServicePeriods(): Promise<Record<Branch, number>> {
  if (isDemoMode()) return { army: 18, navy: 20, airforce: 21, marine: 18, social: 21 };

  const supabase = await createClient();
  const { data } = await supabase.from("service_periods").select("branch, months");
  return Object.fromEntries((data ?? []).map((p) => [p.branch, p.months])) as Record<Branch, number>;
}

// from 날짜(포함) 이후 기록, 최신순 (대시보드 잔디·공부 화면)
export async function getRecordsSince(from: string): Promise<ActivityRecord[]> {
  if (isDemoMode()) return (await demo()).records.filter((r) => r.date >= from);

  const supabase = await createClient();
  const { data } = await supabase
    .from("records")
    .select(RECORD_COLUMNS)
    .gte("date", from)
    .order("date", { ascending: false });
  return (data ?? []) as ActivityRecord[];
}
