"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/auth/actions";
import type { ActionState } from "@/lib/actions";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 md:max-w-xs dark:border-sand-700";

// 비밀번호 설정·변경. 링크로 가입해 비밀번호가 없는 계정도 여기서 만든다.
export default function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePassword, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        새 비밀번호 (8자 이상)
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        새 비밀번호 확인
        <input name="password_confirm" type="password" required minLength={8} autoComplete="new-password" className={INPUT} />
      </label>
      <ActionMessage state={state} />
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl border border-sand-300 font-semibold hover:bg-sand-50 disabled:opacity-60 md:w-auto md:self-start md:px-8 dark:border-sand-700 dark:hover:bg-sand-900"
      >
        {pending ? "저장 중..." : "비밀번호 저장"}
      </button>
    </form>
  );
}
