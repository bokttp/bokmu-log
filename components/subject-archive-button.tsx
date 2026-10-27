"use client";

import { useActionState } from "react";
import { setSubjectArchived, type ActionState } from "@/lib/actions";
import ActionMessage from "./action-message";

// 공부를 마친 과목 보관 / 다시 공부 중으로
export default function SubjectArchiveButton({ id, archived }: { id: string; archived: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setSubjectArchived, null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="archived" value={String(!archived)} />
      <button type="submit" disabled={pending} className="h-12 rounded-xl border border-sand-300 font-semibold disabled:opacity-60 dark:border-sand-700">
        {archived ? "다시 공부하기" : "공부 마침 (보관)"}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}
