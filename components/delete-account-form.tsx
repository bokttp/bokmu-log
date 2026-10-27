"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "@/app/auth/actions";
import type { ActionState } from "@/lib/actions";
import ActionMessage from "./action-message";

// 회원 탈퇴. "탈퇴"를 입력해야 버튼이 켜지고, 한 번 더 확인 창을 띄운다.
export default function DeleteAccountForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(deleteAccount, null);
  const [confirmText, setConfirmText] = useState("");

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("정말 탈퇴할까요? 계정과 모든 목표·기록이 바로 지워지고 되돌릴 수 없어요.")) e.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        탈퇴하면 계정, 복무 정보, 모든 목표와 기록이 바로 지워지고 되돌릴 수 없어요.
      </p>
      <label className="flex flex-col gap-1 text-sm font-medium">
        확인을 위해 &ldquo;탈퇴&rdquo;를 입력하세요
        <input
          name="confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          className="h-12 rounded-xl border border-zinc-300 bg-transparent px-4 md:max-w-xs dark:border-zinc-700"
        />
      </label>
      <ActionMessage state={state} />
      <button
        type="submit"
        disabled={pending || confirmText !== "탈퇴"}
        className="h-12 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700 disabled:opacity-40 md:w-auto md:self-start md:px-8"
      >
        {pending ? "탈퇴 처리 중..." : "회원 탈퇴"}
      </button>
    </form>
  );
}
