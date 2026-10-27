"use client";

import { useActionState } from "react";
import { createGoal, type ActionState } from "@/lib/actions";
import { CATEGORY_LABELS, type GoalCategory } from "@/lib/types";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 dark:border-sand-700";

// 목표 추가 폼. 상자와 열고 닫기는 AddPanel이 맡는다.
export default function GoalForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createGoal, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">카테고리</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as GoalCategory[]).map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="category" value={c} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-flex h-10 items-center rounded-full border border-sand-300 px-4 text-sm peer-checked:border-army-700 peer-checked:bg-army-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-army-500 dark:border-sand-700">
                {CATEGORY_LABELS[c]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-medium">
        목표
        <input name="title" required maxLength={60} placeholder="예: 정보처리기사 필기 합격" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        목표일 (선택)
        <input name="target_date" type="date" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        메모 (선택)
        <textarea name="memo" maxLength={500} rows={2} className="w-full rounded-xl border border-sand-300 bg-transparent p-3 dark:border-sand-700" />
      </label>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="h-12 rounded-xl bg-army-700 font-semibold text-white hover:bg-army-800 disabled:opacity-60">
        {pending ? "저장 중..." : "추가"}
      </button>
    </form>
  );
}
