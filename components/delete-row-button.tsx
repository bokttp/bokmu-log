"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions";
import ActionMessage from "./action-message";

// 목록 한 줄의 삭제 버튼 (책·체력검정 공용). 확인 창을 거친다.
export default function DeleteRowButton({
  id,
  action,
  confirmText,
}: {
  id: string;
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  confirmText: string;
}) {
  const [state, remove, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <div className="flex flex-col items-end gap-1">
      <form
        action={remove}
        onSubmit={(e) => {
          if (!confirm(confirmText)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950"
        >
          {pending ? "지우는 중" : "삭제"}
        </button>
      </form>
      <ActionMessage state={state} />
    </div>
  );
}
