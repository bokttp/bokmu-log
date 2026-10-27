"use client";

import { useActionState } from "react";
import { updateGoalExam, type ActionState } from "@/lib/actions";
import { EXAM_RESULT_LABELS, type ExamResult, type Goal } from "@/lib/types";
import ActionMessage from "./action-message";

const INPUT = "h-11 w-full rounded-xl border border-sand-300 bg-transparent px-3 text-sm dark:border-sand-700";

// 자격증 목표의 시험일·결과 (F-07). 목표 상세에서만 보인다.
export default function GoalExamForm({ goal }: { goal: Pick<Goal, "id" | "exam_date" | "exam_result"> }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateGoalExam, null);

  return (
    <form action={action} className="flex flex-col gap-2 rounded-xl border border-sand-200 p-3 dark:border-sand-800">
      <p className="text-sm font-semibold">시험 정보</p>
      <input type="hidden" name="id" value={goal.id} />
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs text-sand-500">
          시험일
          <input name="exam_date" type="date" defaultValue={goal.exam_date ?? ""} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-sand-500">
          결과
          <select name="exam_result" defaultValue={goal.exam_result ?? "pending"} className={INPUT}>
            {(Object.keys(EXAM_RESULT_LABELS) as ExamResult[]).map((r) => (
              <option key={r} value={r}>
                {EXAM_RESULT_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="h-11 rounded-xl bg-army-700 text-sm font-semibold text-white hover:bg-army-800 disabled:opacity-60">
        {pending ? "저장 중..." : "시험 정보 저장"}
      </button>
    </form>
  );
}
