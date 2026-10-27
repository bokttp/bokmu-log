"use client";

import { useActionState } from "react";
import { createFitnessTest, updateFitnessTest, type ActionState } from "@/lib/actions";
import type { FitnessTest } from "@/lib/types";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 dark:border-sand-700";

// 체력검정 기록 추가·수정 (F-09). 본 종목만 적으면 된다.
// test를 주면 그 기록을 고치는 폼이 되고, 저장에 성공하면 onDone을 부른다.
export default function FitnessForm({ today, test, onDone }: { today: string; test?: FitnessTest; onDone?: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, form) => {
    const result = await (test ? updateFitnessTest : createFitnessTest)(prev, form);
    if (result?.ok) onDone?.();
    return result;
  }, null);
  const run = test?.run_seconds ?? null;

  return (
    <form action={action} className="flex flex-col gap-3">
      {test && <input type="hidden" name="id" value={test.id} />}
      <label className="flex flex-col gap-1 text-sm font-medium">
        검정일
        <input name="tested_on" type="date" required defaultValue={test?.tested_on ?? today} max={today} className={INPUT} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          팔굽혀펴기 (회)
          <input name="pushups" type="number" inputMode="numeric" min={0} max={300} defaultValue={test?.pushups ?? ""} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          윗몸일으키기 (회)
          <input name="situps" type="number" inputMode="numeric" min={0} max={300} defaultValue={test?.situps ?? ""} className={INPUT} />
        </label>
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">3km 달리기</legend>
        <div className="flex items-center gap-2">
          <input name="run_min" type="number" inputMode="numeric" min={5} max={60} defaultValue={run !== null ? Math.floor(run / 60) : ""} aria-label="3km 분" placeholder="분" className={INPUT} />
          <span aria-hidden>:</span>
          <input name="run_sec" type="number" inputMode="numeric" min={0} max={59} defaultValue={run !== null ? run % 60 : ""} aria-label="3km 초" placeholder="초" className={INPUT} />
        </div>
      </fieldset>
      <p className="text-xs text-sand-500">본 종목만 적어도 돼요.</p>
      <ActionMessage state={test && state?.ok ? null : state} />
      <div className="flex gap-2">
        {test && (
          <button type="button" onClick={onDone} className="h-12 flex-1 rounded-xl border border-sand-300 dark:border-sand-700">
            취소
          </button>
        )}
        <button type="submit" disabled={pending} className="h-12 flex-1 rounded-xl bg-army-700 font-semibold text-white hover:bg-army-800 disabled:opacity-60">
          {pending ? "저장 중..." : test ? "저장" : "추가"}
        </button>
      </div>
    </form>
  );
}
