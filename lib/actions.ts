"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isDemoMode } from "./demo";
import {
  BRANCH_LABELS,
  CERT_KIND_LABELS,
  CERT_STATUS_LABELS,
  EXAM_RESULT_LABELS,
  EXAM_STAGE_LABELS,
  type Branch,
  type CertKind,
  type CertStatus,
  type ExamResult,
  type ExamStage,
} from "./types";

// 저장·수정·삭제 서버 액션. 데모 모드에서는 저장하지 않고 안내만 돌려준다.

export type ActionState = { ok: boolean; message: string } | null;

const DEMO: ActionState = { ok: true, message: "데모 모드라서 실제로 저장되지는 않아요." };
const DEMO_DELETE: ActionState = { ok: true, message: "데모 모드라서 실제로 지워지지는 않아요." };
const FAIL: ActionState = { ok: false, message: "저장하지 못했어요. 다시 시도해 주세요." };
const DELETE_FAIL: ActionState = { ok: false, message: "지우지 못했어요. 다시 시도해 주세요." };
const NOT_FOUND: ActionState = { ok: false, message: "찾을 수 없어요. 새로고침 후 다시 시도해 주세요." };

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const orNull = (v: string) => (v === "" ? null : v);
const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

// 본인 행 한 건 삭제 공통 처리. RLS가 본인 행만 지우게 하고, 0건이면 찾을 수 없음으로 본다.
type OwnTable = "records" | "books" | "fitness_tests" | "certificates" | "cert_exams";
async function deleteOwnRow(table: OwnTable, id: string): Promise<"ok" | ActionState> {
  if (isDemoMode()) return DEMO_DELETE;
  if (!isUuid(id)) return NOT_FOUND;

  const supabase = await createClient();
  const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
  if (error) return DELETE_FAIL;
  if (!data?.length) return NOT_FOUND;
  return "ok";
}

// 본인 행 한 건 수정 공통 처리
async function updateOwnRow(table: OwnTable, id: string, values: Record<string, unknown>): Promise<"ok" | ActionState> {
  if (isDemoMode()) return DEMO;
  if (!isUuid(id)) return NOT_FOUND;

  const supabase = await createClient();
  const { data, error } = await supabase.from(table).update(values).eq("id", id).select("id");
  if (error) return FAIL;
  if (!data?.length) return NOT_FOUND;
  return "ok";
}

// ── 공부 기록 ──────────────────────────────────────────────
// 기록은 자격증 아래에 쌓인다. 폼의 target 값은 "c:<자격증 id>" (예전 과목 기록을 고칠 때만 "s:<과목 id>").
function parseRecord(form: FormData) {
  const content = text(form.get("content"));
  const date = text(form.get("date"));
  const minutes = Number(text(form.get("minutes"))) || null;
  const [type, targetId] = text(form.get("target")).split(":");

  if (content.length < 1 || content.length > 200) return { error: { ok: false, message: "내용은 1~200자로 적어 주세요." } };
  if (!isDate(date)) return { error: { ok: false, message: "날짜를 확인해 주세요." } };
  if (minutes !== null && (minutes < 1 || minutes > 1440)) return { error: { ok: false, message: "시간은 1~1440분으로 적어 주세요." } };
  if (!targetId || (type !== "s" && type !== "c")) return { error: { ok: false, message: "자격증을 골라 주세요." } };
  if (!isDemoMode() && !isUuid(targetId)) return { error: NOT_FOUND };
  return {
    values: {
      content,
      date,
      minutes,
      subject_id: type === "s" ? targetId : null,
      certificate_id: type === "c" ? targetId : null,
    },
  };
}

export async function createRecord(_: ActionState, form: FormData): Promise<ActionState> {
  const { error: invalid, values } = parseRecord(form);
  if (invalid || !values) return invalid ?? FAIL;
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const { error } = await supabase.from("records").insert(values);
  if (error) return FAIL;
  refresh();
  return { ok: true, message: "기록했어요." };
}

export async function updateRecord(_: ActionState, form: FormData): Promise<ActionState> {
  const { error: invalid, values } = parseRecord(form);
  if (invalid || !values) return invalid ?? FAIL;
  const result = await updateOwnRow("records", text(form.get("id")), values);
  if (result !== "ok") return result;
  refresh();
  return { ok: true, message: "기록을 고쳤어요." };
}

export async function deleteRecord(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await deleteOwnRow("records", text(form.get("id")));
  if (result !== "ok") return result;
  refresh();
  return { ok: true, message: "기록을 지웠어요." };
}

// ── 자격증 ────────────────────────────────────────────────
// 시험 단계·시험일·결과·점수 검사 (추가·수정 공통)
function parseExam(form: FormData) {
  const stage = text(form.get("stage")) as ExamStage;
  const examDate = orNull(text(form.get("exam_date")));
  const result = (orNull(text(form.get("result"))) ?? "pending") as ExamResult;
  const scoreText = text(form.get("score"));
  const score = scoreText === "" ? null : Number(scoreText);

  if (!(stage in EXAM_STAGE_LABELS)) return { error: { ok: false, message: "시험 단계를 골라 주세요." } };
  if (examDate && !isDate(examDate)) return { error: { ok: false, message: "시험일을 확인해 주세요." } };
  if (!(result in EXAM_RESULT_LABELS)) return { error: FAIL };
  if (score !== null && (!Number.isInteger(score) || score < 0 || score > 1000)) return { error: { ok: false, message: "점수는 0~1000으로 적어 주세요." } };
  return { values: { stage, exam_date: examDate, result, score } };
}

export async function createCertificate(_: ActionState, form: FormData): Promise<ActionState> {
  const name = text(form.get("name"));
  const kind = text(form.get("kind")) as CertKind;
  const issuer = orNull(text(form.get("issuer")));
  const memo = orNull(text(form.get("memo")));
  const examDate = orNull(text(form.get("exam_date")));

  if (name.length < 1 || name.length > 60) return { ok: false, message: "자격증 이름은 1~60자로 적어 주세요." };
  if (!(kind in CERT_KIND_LABELS)) return { ok: false, message: "종류를 골라 주세요." };
  if (issuer && issuer.length > 40) return { ok: false, message: "시행기관은 40자까지 적을 수 있어요." };
  if (memo && memo.length > 500) return { ok: false, message: "메모는 500자까지 적을 수 있어요." };
  const exam = examDate ? parseExam(form) : null;
  if (exam?.error) return exam.error;
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const { data, error } = await supabase.from("certificates").insert({ name, kind, issuer, memo }).select("id").single();
  if (error || !data) return FAIL;
  // 첫 시험일을 함께 적었다면 시험 일정도 만든다
  if (exam?.values) {
    const { error: examError } = await supabase.from("cert_exams").insert({ ...exam.values, certificate_id: data.id });
    if (examError) return { ok: false, message: "자격증은 추가했지만 시험 일정은 저장하지 못했어요. 상세 화면에서 다시 추가해 주세요." };
  }
  refresh();
  return { ok: true, message: "자격증을 추가했어요." };
}

// 상태 변경: 취득이면 취득일(기본 오늘)을 남기고, 아니면 지운다
export async function updateCertificateStatus(_: ActionState, form: FormData): Promise<ActionState> {
  const status = text(form.get("status")) as CertStatus;
  const acquiredOn = orNull(text(form.get("acquired_on")));
  if (!(status in CERT_STATUS_LABELS)) return FAIL;
  if (status === "acquired" && (!acquiredOn || !isDate(acquiredOn))) return { ok: false, message: "취득일을 확인해 주세요." };

  const result = await updateOwnRow("certificates", text(form.get("id")), {
    status,
    acquired_on: status === "acquired" ? acquiredOn : null,
  });
  if (result !== "ok") return result;
  refresh();
  return { ok: true, message: status === "acquired" ? "취득을 축하해요!" : "상태를 바꿨어요." };
}

// 자격증을 지우면 시험 일정도 함께 지워지고, 공부 기록은 남고 연결만 끊긴다
export async function deleteCertificate(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await deleteOwnRow("certificates", text(form.get("id")));
  if (result !== "ok") return result;
  redirect("/certificates");
}

export async function createCertExam(_: ActionState, form: FormData): Promise<ActionState> {
  const certificateId = text(form.get("certificate_id"));
  const { error: invalid, values } = parseExam(form);
  if (invalid || !values) return invalid ?? FAIL;
  if (isDemoMode()) return DEMO;
  if (!isUuid(certificateId)) return NOT_FOUND;

  const supabase = await createClient();
  const { error } = await supabase.from("cert_exams").insert({ ...values, certificate_id: certificateId });
  if (error) return FAIL;
  refresh();
  return { ok: true, message: "시험 일정을 추가했어요." };
}

export async function updateCertExam(_: ActionState, form: FormData): Promise<ActionState> {
  const { error: invalid, values } = parseExam(form);
  if (invalid || !values) return invalid ?? FAIL;
  const result = await updateOwnRow("cert_exams", text(form.get("id")), values);
  if (result !== "ok") return result;
  refresh();
  return { ok: true, message: "시험 정보를 저장했어요." };
}

export async function deleteCertExam(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await deleteOwnRow("cert_exams", text(form.get("id")));
  if (result !== "ok") return result;
  refresh();
  return { ok: true, message: "시험 일정을 지웠어요." };
}

// ── 독서 (F-08) ───────────────────────────────────────────
// 완독일이 비어 있으면 "읽는 중"이다.
export async function createBook(_: ActionState, form: FormData): Promise<ActionState> {
  const title = text(form.get("title"));
  const author = orNull(text(form.get("author")));
  const finishedOn = orNull(text(form.get("finished_on")));
  const rating = Number(text(form.get("rating"))) || null;
  const review = orNull(text(form.get("review")));

  if (title.length < 1 || title.length > 100) return { ok: false, message: "책 제목은 1~100자로 적어 주세요." };
  if (author && author.length > 60) return { ok: false, message: "저자는 60자까지 적을 수 있어요." };
  if (finishedOn && !isDate(finishedOn)) return { ok: false, message: "완독일을 확인해 주세요." };
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) return { ok: false, message: "별점은 1~5점이에요." };
  if (review && review.length > 100) return { ok: false, message: "한줄평은 100자까지 적을 수 있어요." };
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .insert({ title, author, finished_on: finishedOn, rating, review });
  if (error) return FAIL;
  refresh();
  return { ok: true, message: "책을 추가했어요." };
}

export async function deleteBook(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await deleteOwnRow("books", text(form.get("id")));
  if (result !== "ok") return result;
  refresh();
  return { ok: true, message: "책을 지웠어요." };
}

// ── 체력검정 (F-09) ───────────────────────────────────────
// 세 종목 중 하나 이상 입력, 3km는 분·초로 받아 초로 저장한다.
export async function createFitnessTest(_: ActionState, form: FormData): Promise<ActionState> {
  const testedOn = text(form.get("tested_on"));
  const count = (name: string) => {
    const v = text(form.get(name));
    return v === "" ? null : Number(v);
  };
  const pushups = count("pushups");
  const situps = count("situps");
  const runMin = count("run_min");
  const runSec = count("run_sec");
  const runSeconds = runMin === null && runSec === null ? null : (runMin ?? 0) * 60 + (runSec ?? 0);

  if (!isDate(testedOn)) return { ok: false, message: "검정일을 확인해 주세요." };
  if (pushups === null && situps === null && runSeconds === null) return { ok: false, message: "한 종목 이상 적어 주세요." };
  for (const v of [pushups, situps]) {
    if (v !== null && (!Number.isInteger(v) || v < 0 || v > 300)) return { ok: false, message: "횟수는 0~300회로 적어 주세요." };
  }
  if (runSec !== null && (runSec < 0 || runSec > 59)) return { ok: false, message: "초는 0~59로 적어 주세요." };
  if (runSeconds !== null && (!Number.isInteger(runSeconds) || runSeconds < 300 || runSeconds > 3600)) {
    return { ok: false, message: "3km 기록은 5분~60분 사이로 적어 주세요." };
  }
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const { error } = await supabase
    .from("fitness_tests")
    .insert({ tested_on: testedOn, pushups, situps, run_seconds: runSeconds });
  if (error) return FAIL;
  refresh();
  return { ok: true, message: "체력검정 기록을 추가했어요." };
}

export async function deleteFitnessTest(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await deleteOwnRow("fitness_tests", text(form.get("id")));
  if (result !== "ok") return result;
  refresh();
  return { ok: true, message: "체력검정 기록을 지웠어요." };
}

// ── 프로필 ────────────────────────────────────────────────
// 프로필 저장 공통 처리 (설정·온보딩). 저장하면 온보딩 완료로 표시한다.
async function saveProfile(form: FormData): Promise<ActionState> {
  const nickname = text(form.get("nickname"));
  const branch = text(form.get("branch")) as Branch;
  const enlistDate = text(form.get("enlist_date"));
  const dischargeDate = text(form.get("discharge_date"));

  if (nickname.length < 2 || nickname.length > 12) return { ok: false, message: "닉네임은 2~12자로 적어 주세요." };
  if (!(branch in BRANCH_LABELS)) return { ok: false, message: "군종을 골라 주세요." };
  if (!isDate(enlistDate)) return { ok: false, message: "입대일을 확인해 주세요." };
  if (!dischargeDate || dischargeDate <= enlistDate) {
    return { ok: false, message: "전역일은 입대일보다 뒤여야 해요." };
  }
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return FAIL;
  const { error } = await supabase
    .from("profiles")
    .update({ nickname, branch, enlist_date: enlistDate, discharge_date: dischargeDate, onboarded: true })
    .eq("id", user.id);
  if (error) return FAIL;
  return { ok: true, message: "저장했어요." };
}

export async function updateProfile(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await saveProfile(form);
  if (result?.ok) refresh();
  return result;
}

// 온보딩: 저장에 성공하면 대시보드로 이동한다 (데모 모드도 이동만 한다)
export async function completeOnboarding(_: ActionState, form: FormData): Promise<ActionState> {
  const result = await saveProfile(form);
  if (result?.ok) redirect("/dashboard");
  return result;
}
