"use client";

import { useActionState } from "react";
import { deleteGoal, type ActionState } from "@/lib/actions";
import ActionMessage from "./action-message";

// 목표 삭제. 연결된 기록은 남고 "목표 없이 기록"으로 바뀐다.
export default function GoalDeleteButton({ id, recordCount }: { id: string; recordCount: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(deleteGoal, null);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const note = recordCount > 0 ? `\n연결된 기록 ${recordCount}건은 지워지지 않고 "목표 없이 기록"으로 남아요.` : "";
        if (!confirm(`이 목표를 지울까요? 되돌릴 수 없어요.${note}`)) e.preventDefault();
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-lg text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950"
      >
        {pending ? "지우는 중..." : "목표 삭제"}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}
