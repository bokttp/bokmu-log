// DB 테이블 모양 (명세 5.2 + migrations 0003·0004). Supabase 연결 후 supabase gen types로 교체한다.

export type Branch = "army" | "navy" | "airforce" | "marine" | "social";
export type ExamResult = "pending" | "pass" | "fail";
export type CertKind = "national_tech" | "national_pro" | "private" | "language";
export type CertStatus = "preparing" | "acquired" | "dropped";
export type ExamStage = "written" | "practical" | "single";

export type Profile = {
  id: string;
  nickname: string | null;
  branch: Branch | null;
  enlist_date: string | null;
  discharge_date: string | null;
  onboarded: boolean;
};

// 공부 기록. 과목 또는 자격증 아래에 쌓인다 (goal_id는 예전 목표 기록에만 남아 있다)
export type ActivityRecord = {
  id: string;
  subject_id: string | null;
  certificate_id: string | null;
  date: string;
  content: string;
  minutes: number | null;
};

export type CertExam = {
  id: string;
  certificate_id: string;
  stage: ExamStage;
  exam_date: string | null;
  result: ExamResult;
  score: number | null;
};

export type Certificate = {
  id: string;
  name: string;
  kind: CertKind;
  issuer: string | null;
  status: CertStatus;
  acquired_on: string | null;
  memo: string | null;
  exams: CertExam[]; // 시험일 순
  minutes: number; // 누적 공부 시간
  record_count: number;
};

export type Subject = {
  id: string;
  name: string;
  target: string | null; // 예: 토익 800점
  target_date: string | null;
  archived: boolean;
  minutes: number;
  week_minutes: number; // 이번 주(월~일) 공부 시간
  record_count: number;
};

// 기록을 붙일 곳 (과목 또는 자격증). key는 "s:<id>" / "c:<id>"
export type RecordTarget = { key: string; name: string; type: "subject" | "certificate" };

export type Book = {
  id: string;
  title: string;
  author: string | null;
  finished_on: string | null;
  rating: number | null;
  review: string | null;
};

export type FitnessTest = {
  id: string;
  tested_on: string;
  pushups: number | null;
  situps: number | null;
  run_seconds: number | null;
};

// app_settings의 "savings" 값 (F-10)
export type SavingsSettings = {
  monthly_limit: number;
  base_rate: number;
  match_ratio: number;
  max_months: number;
};

export const BRANCH_LABELS: Record<Branch, string> = {
  army: "육군",
  navy: "해군",
  airforce: "공군",
  marine: "해병대",
  social: "사회복무요원",
};

export const EXAM_RESULT_LABELS: Record<ExamResult, string> = {
  pending: "결과 대기",
  pass: "합격",
  fail: "불합격",
};

export const CERT_KIND_LABELS: Record<CertKind, string> = {
  national_tech: "국가기술",
  national_pro: "국가전문",
  private: "민간",
  language: "어학",
};

export const CERT_STATUS_LABELS: Record<CertStatus, string> = {
  preparing: "준비 중",
  acquired: "취득",
  dropped: "포기",
};

export const EXAM_STAGE_LABELS: Record<ExamStage, string> = {
  written: "필기",
  practical: "실기",
  single: "시험",
};
