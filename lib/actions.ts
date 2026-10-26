"use server";

import { refresh } from "next/cache";
import { createClient } from "./supabase/server";
import { isDemoMode } from "./demo";
import type { Branch, GoalCategory, GoalStatus } from "./types";

// 저장·수정·삭제 서버 액션. 데모 모드에서는 저장하지 않고 안내만 돌려준다.

export type ActionState = { ok: boolean; message: string } | null;

const DEMO: ActionState = { ok: true, message: "데모 모드라서 실제로 저장되지는 않아요." };
const FAIL: ActionState = { ok: false, message: "저장하지 못했어요. 다시 시도해 주세요." };

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const orNull = (v: string) => (v === "" ? null : v);

export async function createRecord(_: ActionState, form: FormData): Promise<ActionState> {
  const content = text(form.get("content"));
  const date = text(form.get("date"));
  const minutes = Number(text(form.get("minutes"))) || null;
  const goalId = orNull(text(form.get("goal_id")));

  if (content.length < 1 || content.length > 200) return { ok: false, message: "내용은 1~200자로 적어 주세요." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: "날짜를 확인해 주세요." };
  if (minutes !== null && (minutes < 1 || minutes > 1440)) return { ok: false, message: "시간은 1~1440분으로 적어 주세요." };
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const { error } = await supabase.from("records").insert({ content, date, minutes, goal_id: goalId });
  if (error) return FAIL;
  refresh();
  return { ok: true, message: "기록했어요." };
}

export async function createGoal(_: ActionState, form: FormData): Promise<ActionState> {
  const title = text(form.get("title"));
  const category = text(form.get("category")) as GoalCategory;
  const targetDate = orNull(text(form.get("target_date")));
  const memo = orNull(text(form.get("memo")));

  if (title.length < 1 || title.length > 60) return { ok: false, message: "목표는 1~60자로 적어 주세요." };
  if (!category) return { ok: false, message: "카테고리를 골라 주세요." };
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
  if (isDemoMode()) return DEMO;

  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return FAIL;
  refresh();
  return { ok: true, message: "상태를 바꿨어요." };
}

export async function updateProfile(_: ActionState, form: FormData): Promise<ActionState> {
  const nickname = text(form.get("nickname"));
  const branch = text(form.get("branch")) as Branch;
  const enlistDate = text(form.get("enlist_date"));
  const dischargeDate = text(form.get("discharge_date"));

  if (nickname.length < 2 || nickname.length > 12) return { ok: false, message: "닉네임은 2~12자로 적어 주세요." };
  if (!enlistDate || !dischargeDate || dischargeDate <= enlistDate) {
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
  refresh();
  return { ok: true, message: "저장했어요." };
}
