import { addDays, format, parseISO, subDays } from "date-fns";
import { calcDischargeDate } from "./service";
import type { ActivityRecord, Book, FitnessTest, Goal, Profile } from "./types";

// 데모 모드: Supabase 키가 없는 로컬 개발 환경에서만 예시 데이터로 화면을 보여준다.
// 배포(production)에서는 절대 켜지지 않는다.
export function isDemoMode() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return !configured && process.env.NODE_ENV !== "production";
}

const d = (today: string, offset: number) => format(addDays(parseISO(today), offset), "yyyy-MM-dd");

// 오늘 날짜를 기준으로 예시 데이터를 만든다. 같은 날에는 항상 같은 결과가 나온다.
export function demoData(today: string) {
  const enlist = format(subDays(parseISO(today), 220), "yyyy-MM-dd");

  const profile: Profile = {
    id: "demo-user",
    nickname: "김복무",
    branch: "army",
    enlist_date: enlist,
    discharge_date: calcDischargeDate(enlist, 18),
    onboarded: true,
  };

  const none = { exam_date: null, exam_result: null };
  const goals: Omit<Goal, "record_count">[] = [
    { id: "g1", category: "certificate", title: "정보처리기사 필기 합격", memo: "기출 10회분 풀기", target_date: d(today, 38), status: "in_progress", completed_at: null, exam_date: d(today, 38), exam_result: "pending" },
    { id: "g2", category: "exercise", title: "체력검정 특급", memo: "팔굽혀펴기 72회, 3km 12분 30초", target_date: d(today, 64), status: "in_progress", completed_at: null, ...none },
    { id: "g3", category: "study", title: "토익 800점", memo: null, target_date: d(today, 110), status: "in_progress", completed_at: null, ...none },
    { id: "g4", category: "reading", title: "복무 중 책 12권 읽기", memo: null, target_date: profile.discharge_date, status: "in_progress", completed_at: null, ...none },
    { id: "g5", category: "certificate", title: "한국사능력검정 2급", memo: null, target_date: d(today, -9), status: "done", completed_at: `${d(today, -9)}T12:00:00+09:00`, exam_date: d(today, -30), exam_result: "pass" },
  ];

  // 최근 84일 기록. 날짜마다 0~3건이 규칙적으로 섞이게 만든다.
  const samples: Pick<ActivityRecord, "goal_id" | "content" | "minutes">[] = [
    { goal_id: "g1", content: "필기 기출 1회분 풀이", minutes: 60 },
    { goal_id: "g2", content: "팔굽혀펴기 3세트, 구보 3km", minutes: 40 },
    { goal_id: "g3", content: "토익 LC Part 2 단어 암기", minutes: 30 },
    { goal_id: "g4", content: "《사피엔스》 80쪽까지", minutes: 45 },
    { goal_id: "g1", content: "데이터베이스 과목 오답 정리", minutes: 90 },
    { goal_id: null, content: "영어 뉴스 한 편 듣기", minutes: 20 },
  ];
  const records: ActivityRecord[] = [];
  for (let i = 0; i < 84; i++) {
    const count = [1, 0, 2, 1, 3, 0, 1, 2][(i * 5 + 3) % 8] * (i % 13 === 7 ? 0 : 1);
    for (let k = 0; k < count; k++) {
      const s = samples[(i + k * 2) % samples.length];
      records.push({ id: `r${i}-${k}`, date: d(today, -i), ...s });
    }
  }

  const withCounts: Goal[] = goals.map((g) => ({
    ...g,
    record_count: records.filter((r) => r.goal_id === g.id).length,
  }));

  const books: Book[] = [
    { id: "b1", title: "사피엔스", author: "유발 하라리", finished_on: null, rating: null, review: null },
    { id: "b2", title: "아주 작은 습관의 힘", author: "제임스 클리어", finished_on: d(today, -12), rating: 5, review: "매일 1%씩, 복무 중에 딱 필요한 책" },
    { id: "b3", title: "총, 균, 쇠", author: "재레드 다이아몬드", finished_on: d(today, -41), rating: 4, review: "두껍지만 끝까지 읽은 보람이 있다" },
    { id: "b4", title: "미움받을 용기", author: "기시미 이치로", finished_on: d(today, -75), rating: 4, review: null },
  ];

  // 한 달에 한 번 검정, 점점 좋아지는 흐름
  const fitnessTests: FitnessTest[] = [0, 1, 2, 3, 4, 5].map((k) => ({
    id: `f${k}`,
    tested_on: d(today, -30 * (5 - k) - 3),
    pushups: [48, 52, 55, 61, 64, 68][k],
    situps: [60, 63, 62, 70, 74, 78][k],
    run_seconds: [870, 852, 840, 815, 798, 776][k],
  }));

  return { profile, goals: withCounts, records, books, fitnessTests };
}
