"use client";

import { useActionState } from "react";
import { createSubject, type ActionState } from "@/lib/actions";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 dark:border-sand-700";

// 공부 과목 추가. 자격증 시험 공부는 자격증 화면에서 따로 관리한다.
export default function SubjectForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createSubject, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        과목 이름
        <input name="name" required maxLength={30} placeholder="예: 토익, 파이썬, 경제 공부" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        목표 (선택)
        <input name="target" maxLength={60} placeholder="예: 800점, 기초 문법 끝내기" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        목표일 (선택)
        <input name="target_date" type="date" className={INPUT} />
      </label>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="h-12 rounded-xl bg-army-700 font-semibold text-white hover:bg-army-800 disabled:opacity-60">
        {pending ? "저장 중..." : "추가"}
      </button>
    </form>
  );
}
