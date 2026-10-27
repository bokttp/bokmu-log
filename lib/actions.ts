"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isDemoMode } from "./demo";
import {
  BRANCH_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  type Branch,
  type GoalCategory,
  type GoalStatus,
} from "./types";

// 저장·수정·삭제 서버 액션. 데모 모드에서는 저장하지 않고 안내만 돌려준다.

export type ActionState = { ok: boolean; message: string } | null;

const DEMO: ActionState = { ok: true, message: "데모 모드라서 실제로 저장되지는 않아요." };
const FAIL: ActionState = { ok: false, message: "저장하지 못했어요. 다시 시도해 주세요." };

const NOT_FOUND: ActionState = { ok: false, message: "찾을 수 없어요. 새로고침 후 다시 시도해 주세요." };

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const orNull = (v: string) => (v === "" ? null : v);
const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

// 기록 입력값 검사 (추가·수정 공통). 통과하면 저장할 값을, 아니면 오류 상태를 돌려준다.
function parseRecord(form: FormData) {
  const content = text(form.get("content"));
  const date = text(form.get("date"));
  const minutes = Number(text(form.get("minutes"))) || null;
  const goalId = orNull(text(form.get("goal_id")));

  if (content.length < 1 || content.length > 200) return { error: { ok: false, message: "내용은 1~200자로 적어 주세요." } };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: { ok: false, message: "날짜를 확인해 주세요." } };
  if (minutes !== null && (minutes < 1 || minutes > 1440)) return { error: { ok: false, message: "시간은 1~1440분으로 적어 주세요." } };
  return { values: { content, date, minutes, goal_id: goalId } };
}

export async function createRecord(_: ActionState, form: FormData): Promise<ActionState> {
  const { error: invalid, values } = parseRecord(form);
  if (invalid) return invalid;
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const { error } = await supabase.from("records").insert(values);
  if (error) return FAIL;
  refresh();
  return { ok: true, message: "기록했어요." };
}

// 수정·삭제는 RLS가 본인 행만 허용한다. 0건이면 남의 행이거나 이미 지워진 것이다.
export async function updateRecord(_: ActionState, form: FormData): Promise<ActionState> {
  const id = text(form.get("id"));
  const { error: invalid, values } = parseRecord(form);
  if (invalid) return invalid;
  if (isDemoMode()) return DEMO;
  if (!isUuid(id)) return NOT_FOUND;

  const supabase = await createClient();
  const { data, error } = await supabase.from("records").update(values).eq("id", id).select("id");
  if (error) return FAIL;
  if (!data?.length) return NOT_FOUND;
  refresh();
  return { ok: true, message: "기록을 고쳤어요." };
}

export async function deleteRecord(_: ActionState, form: FormData): Promise<ActionState> {
  const id = text(form.get("id"));
  if (isDemoMode()) return { ok: true, message: "데모 모드라서 실제로 지워지지는 않아요." };
  if (!isUuid(id)) return NOT_FOUND;

  const supabase = await createClient();
  const { data, error } = await supabase.from("records").delete().eq("id", id).select("id");
  if (error) return { ok: false, message: "지우지 못했어요. 다시 시도해 주세요." };
  if (!data?.length) return NOT_FOUND;
  refresh();
  return { ok: true, message: "기록을 지웠어요." };
}

export async function createGoal(_: ActionState, form: FormData): Promise<ActionState> {
  const title = text(form.get("title"));
  const category = text(form.get("category")) as GoalCategory;
  const targetDate = orNull(text(form.get("target_date")));
  const memo = orNull(text(form.get("memo")));

  if (title.length < 1 || title.length > 60) return { ok: false, message: "목표는 1~60자로 적어 주세요." };
  if (!(category in CATEGORY_LABELS)) return { ok: false, message: "카테고리를 골라 주세요." };
  if (memo && memo.length > 500) return { ok: false, message: "메모는 500자까지 적을 수 있어요." };
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .insert({ title, category, target_date: targetDate, memo });
  if (error) return FAIL;
  refresh();
  return { ok: true, message: "목표를 추가했어요." };
}

export async function updateGoalStatus(_: ActionState, form: FormData): Promise<ActionState> {
  const id = text(form.get("id"));
  const status = text(form.get("status")) as GoalStatus;
  if (!(status in STATUS_LABELS)) return FAIL;
  if (isDemoMode()) return DEMO;
  if (!isUuid(id)) return NOT_FOUND;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id");
  if (error) return FAIL;
  if (!data?.length) return NOT_FOUND;
  refresh();
  return { ok: true, message: "상태를 바꿨어요." };
}

// 목표를 지워도 연결된 기록은 남고 목표 연결만 끊긴다 (records.goal_id on delete set null)
export async function deleteGoal(_: ActionState, form: FormData): Promise<ActionState> {
  const id = text(form.get("id"));
  if (isDemoMode()) return { ok: true, message: "데모 모드라서 실제로 지워지지는 않아요." };
  if (!isUuid(id)) return NOT_FOUND;

  const supabase = await createClient();
  const { data, error } = await supabase.from("goals").delete().eq("id", id).select("id");
  if (error) return { ok: false, message: "지우지 못했어요. 다시 시도해 주세요." };
  if (!data?.length) return NOT_FOUND;
  redirect("/goals");
}

// 프로필 저장 공통 처리 (설정·온보딩). 저장하면 온보딩 완료로 표시한다.
async function saveProfile(form: FormData): Promise<ActionState> {
  const nickname = text(form.get("nickname"));
  const branch = text(form.get("branch")) as Branch;
  const enlistDate = text(form.get("enlist_date"));
  const dischargeDate = text(form.get("discharge_date"));

  if (nickname.length < 2 || nickname.length > 12) return { ok: false, message: "닉네임은 2~12자로 적어 주세요." };
  if (!(branch in BRANCH_LABELS)) return { ok: false, message: "군종을 골라 주세요." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(enlistDate)) return { ok: false, message: "입대일을 확인해 주세요." };
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
