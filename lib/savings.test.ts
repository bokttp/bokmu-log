import { describe, expect, it } from "vitest";
import { calcSavings } from "./savings";

describe("calcSavings", () => {
  it("월 10만 원 12개월, 연 5%, 매칭 100%", () => {
    // 이자 = 100000 × 0.05/12 × 78 = 32,500
    expect(calcSavings(100_000, 12, 0.05, 1)).toEqual({
      principal: 1_200_000,
      interest: 32_500,
      match: 1_200_000,
      total: 2_432_500,
    });
  });

  it("금리·매칭이 0이면 원금만", () => {
    expect(calcSavings(50_000, 6, 0, 0)).toEqual({ principal: 300_000, interest: 0, match: 0, total: 300_000 });
  });

  it("이자는 원 단위로 반올림", () => {
    expect(calcSavings(10_000, 1, 0.05, 0).interest).toBe(42); // 41.666...
  });
});
