"use client";

import { useState } from "react";
import type { ActivityRecord } from "@/lib/types";

type Cell = { date: string; future: boolean };

const LEVEL_CLASS = [
  "bg-zinc-100 dark:bg-zinc-800",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-400 dark:bg-emerald-700",
  "bg-emerald-600 dark:bg-emerald-500",
];
const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

// 최근 12주 기록 잔디. 칸을 누르면 그날 기록을 아래에 보여준다. (명세 7.3)
export default function RecordGrass({
  weeks,
  records,
}: {
  weeks: Cell[][]; // [주][요일]
  records: ActivityRecord[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const byDate = new Map<string, ActivityRecord[]>();
  for (const r of records) byDate.set(r.date, [...(byDate.get(r.date) ?? []), r]);
  const level = (date: string) => Math.min(byDate.get(date)?.length ?? 0, 3);
  const dayRecords = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div>
      <div className="flex gap-1">
        <div className="grid grid-rows-7 gap-1 pr-1 text-[10px] leading-none text-zinc-400">
          {WEEKDAYS.map((w, i) => (
            <span key={w} className="flex h-4 items-center">
              {i % 2 === 0 ? w : ""}
            </span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0].date} className="grid flex-1 grid-rows-7 gap-1">
            {week.map((cell) =>
              cell.future ? (
                <span key={cell.date} className="h-4" />
              ) : (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelected(cell.date === selected ? null : cell.date)}
                  aria-label={`${cell.date} 기록 ${byDate.get(cell.date)?.length ?? 0}건`}
                  className={`h-4 rounded-sm ${LEVEL_CLASS[level(cell.date)]} ${
                    cell.date === selected ? "ring-2 ring-zinc-900 dark:ring-white" : ""
                  }`}
                />
              ),
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-zinc-400">
        적음
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        많음
      </div>

      {selected && (
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
          <p className="text-sm font-semibold">{selected.slice(5).replace("-", "월 ")}일 기록</p>
          {dayRecords.length === 0 ? (
            <p className="mt-1 text-sm text-zinc-500">이날은 기록이 없어요.</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-1 text-sm">
              {dayRecords.map((r) => (
                <li key={r.id} className="flex justify-between gap-2">
                  <span>{r.content}</span>
                  {r.minutes && <span className="shrink-0 text-zinc-500">{r.minutes}분</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
