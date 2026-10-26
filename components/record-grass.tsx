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

const label = (date: string) => `${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일`;

// 최근 12주 기록 잔디. 칸을 누르면 그날 기록을 보여준다. (명세 7.3)
// 넓은 화면에서는 잔디 오른쪽에, 좁은 화면에서는 아래에 기록이 나온다.
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
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <div className="w-full lg:max-w-md">
        {/* 첫 열은 요일, 이후 12열은 주. grid-flow-col로 위→아래, 왼쪽→오른쪽 순서로 채운다 */}
        <div className="grid grid-flow-col grid-cols-[auto_repeat(12,minmax(0,1fr))] grid-rows-7 gap-1">
          {WEEKDAYS.map((w, i) => (
            <span key={w} className="flex items-center pr-1 text-[10px] leading-none text-zinc-400">
              {i % 2 === 0 ? w : ""}
            </span>
          ))}
          {weeks.flat().map((cell) =>
            cell.future ? (
              <span key={cell.date} className="aspect-square" />
            ) : (
              <button
                key={cell.date}
                type="button"
                onClick={() => setSelected(cell.date === selected ? null : cell.date)}
                title={`${label(cell.date)} · ${byDate.get(cell.date)?.length ?? 0}건`}
                aria-label={`${label(cell.date)} 기록 ${byDate.get(cell.date)?.length ?? 0}건`}
                className={`aspect-square rounded-sm hover:ring-2 hover:ring-zinc-400 ${LEVEL_CLASS[level(cell.date)]} ${
                  cell.date === selected ? "ring-2 ring-zinc-900 dark:ring-white" : ""
                }`}
              />
            ),
          )}
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-zinc-400">
          적음
          {LEVEL_CLASS.map((c) => (
            <span key={c} className={`h-3 w-3 rounded-sm ${c}`} />
          ))}
          많음
        </div>
      </div>

      <div className="min-h-24 flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
        {!selected ? (
          <p className="text-sm text-zinc-500">칸을 누르면 그날 기록이 여기에 보여요.</p>
        ) : (
          <>
            <p className="text-sm font-semibold">{label(selected)} 기록</p>
            {dayRecords.length === 0 ? (
              <p className="mt-1 text-sm text-zinc-500">이날은 기록이 없어요.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2 text-sm">
                {dayRecords.map((r) => (
                  <li key={r.id} className="flex justify-between gap-2">
                    <span>{r.content}</span>
                    {r.minutes && <span className="shrink-0 text-zinc-500">{r.minutes}분</span>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
