"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRun } from "@/lib/fitness";
import type { FitnessTest } from "@/lib/types";

const EVENTS = [
  { key: "pushups", label: "팔굽혀펴기", unit: "회", format: (v: number) => `${v}회` },
  { key: "situps", label: "윗몸일으키기", unit: "회", format: (v: number) => `${v}회` },
  { key: "run_seconds", label: "3km 달리기", unit: "분:초", format: formatRun },
] as const;

// 종목별 선 그래프 (F-09). 3km는 기록이 짧을수록 좋으므로 세로축을 뒤집어 위로 갈수록 좋게 보인다.
// 선 색은 currentColor라서 감싼 요소의 글자색(라이트: 올리브, 다크: 카키)을 따른다.
export default function FitnessChart({ tests }: { tests: FitnessTest[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {EVENTS.map((e) => {
        const data = tests
          .filter((t) => t[e.key] !== null)
          .map((t) => ({ date: t.tested_on.slice(5).replace("-", "."), value: t[e.key] as number }));
        const latest = data.at(-1);
        const first = data.at(0);
        // 첫 기록 대비 변화 (최근 값은 위 요약 칸에 있으므로 여기서는 변화만 보여준다)
        const diff = latest && first && data.length > 1 ? latest.value - first.value : null;
        const better = diff !== null && (e.key === "run_seconds" ? diff < 0 : diff > 0);
        const diffText =
          diff === null || diff === 0
            ? null
            : e.key === "run_seconds"
              ? `${diff < 0 ? "-" : "+"}${formatRun(Math.abs(diff))}`
              : `${diff > 0 ? "+" : ""}${diff}회`;

        return (
          <section key={e.key} className="rounded-2xl border border-sand-200 bg-white/80 p-4 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">{e.label}</h3>
              {diffText && (
                <span className={`text-sm font-semibold ${better ? "text-army-700 dark:text-khaki-300" : "text-red-600 dark:text-red-400"}`}>
                  {diffText}
                </span>
              )}
            </div>
            <p className="mb-2 text-xs text-sand-500">
              {e.key === "run_seconds" ? "짧을수록 좋아요 (위가 빠름)" : "많을수록 좋아요"}
              {diffText && " · 첫 기록 대비"}
            </p>
            {data.length < 2 ? (
              <p className="flex h-40 items-center justify-center text-center text-sm text-sand-500">
                {data.length === 0 ? "아직 기록이 없어요." : "기록이 2개 이상이면 그래프가 그려져요."}
              </p>
            ) : (
              <div className="h-40 text-army-700 dark:text-khaki-300" role="img" aria-label={`${e.label} 기록 변화, 최근 ${e.format(latest!.value)}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#8f8264", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis
                      domain={["auto", "auto"]}
                      reversed={e.key === "run_seconds"}
                      tickFormatter={e.key === "run_seconds" ? formatRun : undefined}
                      tick={{ fill: "#8f8264", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={e.key === "run_seconds" ? 56 : 44}
                    />
                    <Tooltip
                      formatter={(v) => [e.format(Number(v)), e.label]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #d4c9ad", background: "#faf8f2", color: "#26231d" }}
                    />
                    <Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2.5} dot={{ r: 3, fill: "currentColor" }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
