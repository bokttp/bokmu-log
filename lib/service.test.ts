import { describe, expect, it } from "vitest";
import { calcDischargeDate, formatDday, promotionDates, rankStatus, serviceProgress } from "./service";

// 명세 7.5 단위 테스트 케이스
describe("calcDischargeDate", () => {
  it("입대일 + 개월 수 - 1일", () => {
    expect(calcDischargeDate("2026-03-02", 18)).toBe("2027-09-01");
  });
  it("달 말일 입대", () => {
    expect(calcDischargeDate("2026-01-31", 18)).toBe("2027-07-30");
  });
});

describe("serviceProgress", () => {
  it("입대일 당일은 0%", () => {
    expect(serviceProgress("2026-03-02", "2027-09-01", "2026-03-02").percent).toBe(0);
  });
  it("전역일이 지나면 100%, dday 음수", () => {
    const p = serviceProgress("2026-03-02", "2027-09-01", "2027-09-05");
    expect(p.percent).toBe(100);
    expect(p.dday).toBe(-4);
  });
});

describe("promotionDates", () => {
  it("입대월 기준 매월 1일 진급", () => {
    expect(promotionDates("2026-03-02").map((p) => p.date)).toEqual([
      "2026-05-01",
      "2026-11-01",
      "2027-05-01",
    ]);
  });
});

describe("rankStatus", () => {
  it("일병 진급일 당일부터 일병", () => {
    expect(rankStatus("2026-03-02", "2026-05-01")).toEqual({
      current: "일병",
      next: { rank: "상병", date: "2026-11-01" },
    });
  });
  it("병장이면 다음 진급 없음", () => {
    expect(rankStatus("2026-03-02", "2027-06-01").next).toBeNull();
  });
});

describe("formatDday", () => {
  it("남은 날, 당일, 지난 날", () => {
    expect(formatDday(12)).toBe("D-12");
    expect(formatDday(0)).toBe("D-Day");
    expect(formatDday(-3)).toBe("D+3");
  });
});
