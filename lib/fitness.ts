// 3km 기록(초)을 "분:초"로 표시한다. 예: 776 → "12:56"
export const formatRun = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
