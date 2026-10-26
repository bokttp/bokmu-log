import "server-only";
import { connection } from "next/server";
import { createClient } from "./supabase/server";
import { demoData, isDemoMode } from "./demo";
import { todayKST } from "./service";
import type { ActivityRecord, Branch, Goal, Profile } from "./types";

// 화면에서 쓰는 데이터 조회. 데모 모드면 예시 데이터, 아니면 Supabase에서 읽는다.
// RLS가 본인 행만 돌려주므로 user_id 조건은 따로 걸지 않는다.

async function demo() {
  await connection(); // 오늘 날짜를 쓰므로 요청 시점에 계산
  return demoData(todayKST());
}

// 진행 중이 위, 그다음 목표일이 가까운 순 (명세 F-04)
function sortGoals(goals: Goal[]) {
  const rank = { in_progress: 0, done: 1, dropped: 2 } as const;
  return [...goals].sort(
    (a, b) =>
      rank[a.status] - rank[b.status] ||
      (a.target_date ?? "9999").localeCompare(b.target_date ?? "9999"),
  );
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

export async function getGoals(): Promise<Goal[]> {
  if (isDemoMode()) return sortGoals((await demo()).goals);

  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("id, category, title, memo, target_date, status, completed_at, records(count)");
  const goals = (data ?? []).map(({ records, ...g }) => ({
    ...g,
    record_count: (records as unknown as { count: number }[])[0]?.count ?? 0,
  })) as Goal[];
  return sortGoals(goals);
}

export async function getGoal(id: string) {
  if (isDemoMode()) {
    const { goals, records } = await demo();
    const goal = goals.find((g) => g.id === id);
    return goal ? { goal, records: records.filter((r) => r.goal_id === id) } : null;
  }

  const goals = await getGoals();
  const goal = goals.find((g) => g.id === id);
  if (!goal) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("records")
    .select("id, goal_id, date, content, minutes")
    .eq("goal_id", id)
    .order("date", { ascending: false });
  return { goal, records: (data ?? []) as ActivityRecord[] };
}

// 군종별 복무 개월 수 (전역일 자동 계산용)
export async function getServicePeriods(): Promise<Record<Branch, number>> {
  if (isDemoMode()) return { army: 18, navy: 20, airforce: 21, marine: 18, social: 21 };

  const supabase = await createClient();
  const { data } = await supabase.from("service_periods").select("branch, months");
  return Object.fromEntries((data ?? []).map((p) => [p.branch, p.months])) as Record<Branch, number>;
}

// from 날짜(포함) 이후 기록, 최신순
export async function getRecordsSince(from: string): Promise<ActivityRecord[]> {
  if (isDemoMode()) return (await demo()).records.filter((r) => r.date >= from);

  const supabase = await createClient();
  const { data } = await supabase
    .from("records")
    .select("id, goal_id, date, content, minutes")
    .gte("date", from)
    .order("date", { ascending: false });
  return (data ?? []) as ActivityRecord[];
}
