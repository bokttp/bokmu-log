"use client";

import { useActionState } from "react";
import { createFitnessTest, type ActionState } from "@/lib/actions";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 dark:border-sand-700";

// 체력검정 기록 추가 (F-09). 본 종목만 적으면 된다.
export default function FitnessForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createFitnessTest, null);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
      <h2 className="font-semibold">기록 추가</h2>
      <label className="flex flex-col gap-1 text-sm font-medium">
        검정일
        <input name="tested_on" type="date" required defaultValue={today} max={today} className={INPUT} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          팔굽혀펴기 (회)
          <input name="pushups" type="number" inputMode="numeric" min={0} max={300} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          윗몸일으키기 (회)
          <input name="situps" type="number" inputMode="numeric" min={0} max={300} className={INPUT} />
        </label>
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">3km 달리기</legend>
        <div className="flex items-center gap-2">
          <input name="run_min" type="number" inputMode="numeric" min={5} max={60} aria-label="3km 분" placeholder="분" className={INPUT} />
          <span aria-hidden>:</span>
          <input name="run_sec" type="number" inputMode="numeric" min={0} max={59} aria-label="3km 초" placeholder="초" className={INPUT} />
        </div>
      </fieldset>
      <p className="text-xs text-sand-500">본 종목만 적어도 돼요.</p>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="h-12 rounded-xl bg-army-700 font-semibold text-white hover:bg-army-800 disabled:opacity-60">
        {pending ? "저장 중..." : "추가"}
      </button>
    </form>
  );
}
