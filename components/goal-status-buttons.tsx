"use client";

import { useActionState } from "react";
import { updateGoalStatus, type ActionState } from "@/lib/actions";
import type { GoalStatus } from "@/lib/types";
import ActionMessage from "./action-message";

const NEXT: Record<GoalStatus, { status: GoalStatus; label: string }[]> = {
  in_progress: [
    { status: "done", label: "완료로 표시" },
    { status: "dropped", label: "포기" },
  ],
  done: [{ status: "in_progress", label: "다시 진행" }],
  dropped: [{ status: "in_progress", label: "다시 진행" }],
};

export default function GoalStatusButtons({ id, status }: { id: string; status: GoalStatus }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateGoalStatus, null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {NEXT[status].map((n) => (
          <form key={n.status} action={action} className="flex-1">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={n.status} />
            <button
              type="submit"
              disabled={pending}
              className={`h-12 w-full rounded-xl font-semibold disabled:opacity-60 ${
                n.status === "done"
                  ? "bg-army-700 text-white"
                  : "border border-sand-300 dark:border-sand-700"
              }`}
            >
              {n.label}
            </button>
          </form>
        ))}
      </div>
      <ActionMessage state={state} />
    </div>
  );
}
