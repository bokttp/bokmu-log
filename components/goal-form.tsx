"use client";

import { useActionState, useState } from "react";
import { createGoal, type ActionState } from "@/lib/actions";
import { CATEGORY_LABELS, type GoalCategory } from "@/lib/types";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-zinc-300 bg-transparent px-4 dark:border-zinc-700";

// 목표 추가: 버튼을 누르면 아래에 폼이 펼쳐진다
export default function GoalForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(createGoal, null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
      >
        + 목표 추가
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h2 className="font-semibold">새 목표</h2>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">카테고리</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as GoalCategory[]).map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="category" value={c} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-flex h-10 items-center rounded-full border border-zinc-300 px-4 text-sm peer-checked:border-emerald-700 peer-checked:bg-emerald-700 peer-checked:text-white dark:border-zinc-700">
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
        <textarea name="memo" maxLength={500} rows={2} className="w-full rounded-xl border border-zinc-300 bg-transparent p-3 dark:border-zinc-700" />
      </label>
      <ActionMessage state={state} />
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="h-12 flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700">
          닫기
        </button>
        <button type="submit" disabled={pending} className="h-12 flex-1 rounded-xl bg-emerald-700 font-semibold text-white disabled:opacity-60">
          {pending ? "저장 중..." : "추가"}
        </button>
      </div>
    </form>
  );
}
