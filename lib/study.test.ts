import { describe, expect, it } from "vitest";
import { hours, nextExam, studyStreak, weekStartOf } from "./study";
import type { CertExam } from "./types";

describe("studyStreak", () => {
  it("오늘부터 거꾸로 이어진 날 수", () => {
    expect(studyStreak(["2026-10-27", "2026-10-26", "2026-10-25", "2026-10-23"], "2026-10-27")).toBe(3);
  });
  it("오늘 기록이 없으면 어제부터 센다", () => {
    expect(studyStreak(["2026-10-26", "2026-10-25"], "2026-10-27")).toBe(2);
  });
  it("어제도 없으면 0", () => {
    expect(studyStreak(["2026-10-24"], "2026-10-27")).toBe(0);
  });
});

describe("weekStartOf", () => {
  it("월요일 시작", () => {
    expect(weekStartOf("2026-10-27")).toBe("2026-10-26"); // 화요일 → 월요일
    expect(weekStartOf("2026-11-01")).toBe("2026-10-26"); // 일요일 → 그 주 월요일
  });
});

describe("nextExam", () => {
  const exam = (id: string, exam_date: string | null, result: CertExam["result"]): CertExam => ({
    id, certificate_id: "c", stage: "single", exam_date, result, score: null,
  });
  it("결과 대기 중이고 오늘 이후인 가장 빠른 시험", () => {
    const exams = [exam("a", "2026-12-01", "pending"), exam("b", "2026-11-10", "pending"), exam("c", "2026-10-01", "pending"), exam("d", "2026-10-30", "pass")];
    expect(nextExam(exams, "2026-10-27")?.id).toBe("b");
  });
  it("없으면 null", () => {
    expect(nextExam([exam("a", null, "pending")], "2026-10-27")).toBeNull();
  });
});

describe("hours", () => {
  it("소수 첫째 자리 시간", () => {
    expect(hours(95)).toBe("1.6시간");
    expect(hours(0)).toBe("0시간");
  });
});
