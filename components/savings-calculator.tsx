"use client";

import { useState } from "react";
import { calcSavings } from "@/lib/savings";
import type { SavingsSettings } from "@/lib/types";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 dark:border-sand-700";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

// 적금 계산기 (F-10). 입력할 때마다 바로 계산하고 저장하지 않는다.
export default function SavingsCalculator({ settings, defaultMonths }: { settings: SavingsSettings; defaultMonths: number }) {
  const [monthly, setMonthly] = useState(String(Math.min(300_000, settings.monthly_limit)));
  const [months, setMonths] = useState(String(defaultMonths));

  const p = Math.max(0, Math.floor(Number(monthly) || 0));
  const n = Math.min(settings.max_months, Math.max(0, Math.floor(Number(months) || 0)));
  const overLimit = p > settings.monthly_limit;
  const result = calcSavings(p, n, settings.base_rate, settings.match_ratio);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
      <section className="flex flex-col gap-4 rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
        <label className="flex flex-col gap-1 text-sm font-medium">
          월 납입액 (원)
          <input type="number" inputMode="numeric" min={0} step={10_000} value={monthly} onChange={(e) => setMonthly(e.target.value)} className={INPUT} />
        </label>
        {overLimit && (
          <p role="alert" className="-mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            월 한도 {won(settings.monthly_limit)}를 넘었어요. 한도를 넘는 금액은 넣을 수 없어요.
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm font-medium">
          기간 (개월, 최대 {settings.max_months})
          <input type="number" inputMode="numeric" min={1} max={settings.max_months} value={months} onChange={(e) => setMonths(e.target.value)} className={INPUT} />
        </label>
        <dl className="grid grid-cols-3 gap-2 text-center text-xs text-sand-500">
          <div className="rounded-xl bg-sand-100/70 py-2 dark:bg-sand-900">
            <dt>월 한도</dt>
            <dd className="mt-1 font-semibold text-sand-700 dark:text-sand-300">{(settings.monthly_limit / 10_000).toLocaleString("ko-KR")}만 원</dd>
          </div>
          <div className="rounded-xl bg-sand-100/70 py-2 dark:bg-sand-900">
            <dt>기본 금리</dt>
            <dd className="mt-1 font-semibold text-sand-700 dark:text-sand-300">연 {Math.round(settings.base_rate * 1000) / 10}%</dd>
          </div>
          <div className="rounded-xl bg-sand-100/70 py-2 dark:bg-sand-900">
            <dt>정부 매칭</dt>
            <dd className="mt-1 font-semibold text-sand-700 dark:text-sand-300">{Math.round(settings.match_ratio * 100)}%</dd>
          </div>
        </dl>
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-army-800 p-5 text-khaki-100 shadow-md md:p-8">
        <div className="camo pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative" aria-live="polite">
          <p className="text-sm text-khaki-200">{n}개월 뒤 받는 금액 (예상)</p>
          <p className="mt-2 font-stencil text-4xl tracking-wide md:text-5xl">{result.total.toLocaleString("ko-KR")}</p>
          <p className="text-sm text-khaki-200">원</p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-khaki-300">원금</dt>
              <dd className="font-semibold">{won(result.principal)}</dd>
            </div>
            <div>
              <dt className="text-khaki-300">예상 이자</dt>
              <dd className="font-semibold">{won(result.interest)}</dd>
            </div>
            <div>
              <dt className="text-khaki-300">정부 매칭 지원금</dt>
              <dd className="font-semibold">{won(result.match)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
