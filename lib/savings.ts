// 적금 계산기 (명세 7.4). 저장 없이 계산만 하는 순수 함수.
// 이자 = P × r/12 × n(n+1)/2 (매달 같은 금액을 넣는 단리 적금), 매칭 = P × n × m

export type SavingsResult = {
  principal: number;
  interest: number;
  match: number;
  total: number;
};

export function calcSavings(monthly: number, months: number, rate: number, matchRatio: number): SavingsResult {
  const principal = monthly * months;
  const interest = Math.round(monthly * (rate / 12) * ((months * (months + 1)) / 2));
  const match = Math.round(principal * matchRatio);
  return { principal, interest, match, total: principal + interest + match };
}
