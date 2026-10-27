import { addDays, format, parseISO, subDays } from "date-fns";
import { calcDischargeDate } from "./service";
import type { ActivityRecord, Book, CertExam, Certificate, FitnessTest, Profile } from "./types";

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

  const exams: CertExam[] = [
    { id: "e1", certificate_id: "c1", stage: "written", exam_date: d(today, 38), result: "pending", score: null },
    { id: "e2", certificate_id: "c1", stage: "practical", exam_date: d(today, 102), result: "pending", score: null },
    { id: "e3", certificate_id: "c2", stage: "single", exam_date: d(today, -30), result: "pass", score: 82 },
    { id: "e4", certificate_id: "c3", stage: "written", exam_date: d(today, -45), result: "pass", score: 78 },
    { id: "e5", certificate_id: "c3", stage: "practical", exam_date: d(today, 17), result: "pending", score: null },
    { id: "e6", certificate_id: "c4", stage: "single", exam_date: d(today, 60), result: "pending", score: null },
  ];
  const certBase: Omit<Certificate, "exams" | "minutes" | "record_count">[] = [
    { id: "c1", name: "정보처리기사", kind: "national_tech", issuer: "한국산업인력공단", status: "preparing", acquired_on: null, memo: "기출 10회분 풀기" },
    { id: "c3", name: "컴퓨터활용능력 1급", kind: "national_tech", issuer: "대한상공회의소", status: "preparing", acquired_on: null, memo: null },
    { id: "c4", name: "토익 800점", kind: "language", issuer: "한국TOEIC위원회", status: "preparing", acquired_on: null, memo: null },
    { id: "c2", name: "한국사능력검정 2급", kind: "national_pro", issuer: "국사편찬위원회", status: "acquired", acquired_on: d(today, -9), memo: null },
  ];

  // 최근 84일 기록. 날짜마다 0~3건이 규칙적으로 섞이게 만든다.
  const samples: Pick<ActivityRecord, "subject_id" | "certificate_id" | "content" | "minutes">[] = [
    { subject_id: null, certificate_id: "c1", content: "필기 기출 1회분 풀이", minutes: 60 },
    { subject_id: null, certificate_id: "c4", content: "LC Part 2 단어 암기", minutes: 30 },
    { subject_id: null, certificate_id: "c3", content: "엑셀 함수 실기 연습", minutes: 50 },
    { subject_id: null, certificate_id: "c1", content: "데이터베이스 과목 오답 정리", minutes: 90 },
    { subject_id: null, certificate_id: "c4", content: "RC Part 5 문법 문제 30개", minutes: 40 },
    { subject_id: null, certificate_id: "c3", content: "필기 기출 한 회 오답 정리", minutes: 20 },
  ];
  const records: ActivityRecord[] = [];
  for (let i = 0; i < 84; i++) {
    const count = [1, 0, 2, 1, 3, 0, 1, 2][(i * 5 + 3) % 8] * (i % 13 === 7 ? 0 : 1);
    for (let k = 0; k < count; k++) {
      const s = samples[(i + k * 2) % samples.length];
      records.push({ id: `r${i}-${k}`, date: d(today, -i), ...s });
    }
  }

  const sum = (list: ActivityRecord[]) => list.reduce((t, r) => t + (r.minutes ?? 0), 0);

  const certificates: Certificate[] = certBase.map((c) => {
    const own = records.filter((r) => r.certificate_id === c.id);
    return { ...c, exams: exams.filter((e) => e.certificate_id === c.id), minutes: sum(own), record_count: own.length };
  });

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

  return { profile, certificates, records, books, fitnessTests };
}
