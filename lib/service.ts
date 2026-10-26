import { addMonths, differenceInCalendarDays, format, parseISO, subDays } from "date-fns";

// 날짜는 모두 한국 시간 기준 'YYYY-MM-DD' 문자열로 다룬다. (명세 7.1)

export const todayKST = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

export function calcDischargeDate(enlist: string, months: number): string {
  return format(subDays(addMonths(parseISO(enlist), months), 1), "yyyy-MM-dd");
}

export function serviceProgress(enlist: string, discharge: string, today = todayKST()) {
  const total = differenceInCalendarDays(parseISO(discharge), parseISO(enlist));
  const done = differenceInCalendarDays(parseISO(today), parseISO(enlist));
  const percent = Math.min(100, Math.max(0, (done / total) * 100));
  const dday = differenceInCalendarDays(parseISO(discharge), parseISO(today));
  return { percent: Math.round(percent * 10) / 10, dday };
}

// 진급 간격(개월). 실제 진급은 부대 심사로 달라질 수 있어 "예상"으로 표시한다. (명세 7.2)
export const RANK_MONTHS = { private: 2, privateFirst: 6, corporal: 6 } as const;

export function promotionDates(enlist: string) {
  const first = parseISO(enlist.slice(0, 7) + "-01"); // 입대월 1일
  const pfc = addMonths(first, RANK_MONTHS.private);
  const cpl = addMonths(pfc, RANK_MONTHS.privateFirst);
  const sgt = addMonths(cpl, RANK_MONTHS.corporal);
  return [
    { rank: "일병", date: format(pfc, "yyyy-MM-dd") },
    { rank: "상병", date: format(cpl, "yyyy-MM-dd") },
    { rank: "병장", date: format(sgt, "yyyy-MM-dd") },
  ];
}

// 오늘 기준 현재 계급과 다음 진급 (병장이면 next는 null)
export function rankStatus(enlist: string, today = todayKST()) {
  const promotions = promotionDates(enlist);
  const passed = promotions.filter((p) => p.date <= today);
  const current = passed.at(-1)?.rank ?? "이병";
  const next = promotions.find((p) => p.date > today) ?? null;
  return { current, next };
}

// D-day 표기: 남으면 D-12, 당일 D-Day, 지나면 D+3
export function formatDday(days: number) {
  if (days === 0) return "D-Day";
  return days > 0 ? `D-${days}` : `D+${-days}`;
}
