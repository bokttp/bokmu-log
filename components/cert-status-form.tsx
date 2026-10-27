"use client";

import { useActionState } from "react";
import { updateCertificateStatus, type ActionState } from "@/lib/actions";
import type { CertStatus } from "@/lib/types";
import ActionMessage from "./action-message";

// 자격증 상태 바꾸기: 준비 중 → 취득(취득일) / 포기, 취득·포기 → 다시 준비
export default function CertStatusForm({ id, status, today }: { id: string; status: CertStatus; today: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateCertificateStatus, null);

  if (status !== "preparing") {
    return (
      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="preparing" />
        <button type="submit" disabled={pending} className="h-12 rounded-xl border border-sand-300 font-semibold disabled:opacity-60 dark:border-sand-700">
          다시 준비하기
        </button>
        <ActionMessage state={state} />
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={action} className="flex gap-2">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="acquired" />
        <input name="acquired_on" type="date" required defaultValue={today} max={today} aria-label="취득일" className="h-12 min-w-0 flex-1 rounded-xl border border-sand-300 bg-transparent px-3 text-sm dark:border-sand-700" />
        <button type="submit" disabled={pending} className="h-12 shrink-0 rounded-xl bg-army-700 px-4 font-semibold text-white hover:bg-army-800 disabled:opacity-60">
          취득했어요
        </button>
      </form>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="dropped" />
        <button type="submit" disabled={pending} className="h-11 w-full rounded-xl border border-sand-300 text-sm disabled:opacity-60 dark:border-sand-700">
          포기
        </button>
      </form>
      <ActionMessage state={state} />
    </div>
  );
}
