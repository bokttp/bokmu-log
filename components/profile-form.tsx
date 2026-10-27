"use client";

import { useActionState, useState } from "react";
import { completeOnboarding, updateProfile, type ActionState } from "@/lib/actions";
import { calcDischargeDate } from "@/lib/service";
import { BRANCH_LABELS, type Branch, type Profile } from "@/lib/types";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-zinc-300 bg-transparent px-4 dark:border-zinc-700";

// 프로필 입력. 군종·입대일을 바꾸면 전역일을 다시 계산하고, 직접 고칠 수도 있다.
// mode="onboarding"이면 저장 후 대시보드로 이동한다.
export default function ProfileForm({
  profile,
  periods,
  mode = "settings",
}: {
  profile: Profile | null;
  periods: Record<Branch, number>;
  mode?: "settings" | "onboarding";
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    mode === "onboarding" ? completeOnboarding : updateProfile,
    null,
  );
  const [branch, setBranch] = useState<Branch>(profile?.branch ?? "army");
  const [enlist, setEnlist] = useState(profile?.enlist_date ?? "");
  const [discharge, setDischarge] = useState(profile?.discharge_date ?? "");

  const recalc = (b: Branch, e: string) => {
    if (e && periods[b]) setDischarge(calcDischargeDate(e, periods[b]));
  };

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        닉네임
        <input
          name="nickname"
          defaultValue={profile?.nickname ?? ""}
          required
          minLength={2}
          maxLength={12}
          placeholder="2~12자, 실명 대신 닉네임"
          className={INPUT}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        군종
        <select
          name="branch"
          value={branch}
          onChange={(e) => {
            const b = e.target.value as Branch;
            setBranch(b);
            recalc(b, enlist);
          }}
          className={INPUT}
        >
          {(Object.entries(BRANCH_LABELS) as [Branch, string][]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        입대일
        <input
          name="enlist_date"
          type="date"
          required
          value={enlist}
          onChange={(e) => {
            setEnlist(e.target.value);
            recalc(branch, e.target.value);
          }}
          className={INPUT}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        전역일
        <input
          name="discharge_date"
          type="date"
          required
          value={discharge}
          onChange={(e) => setDischarge(e.target.value)}
          className={INPUT}
        />
        <span className="text-xs font-normal text-zinc-500">
          자동 계산된 날짜예요. 조기전역·연장 등으로 다르면 직접 고치세요.
        </span>
      </label>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="h-12 rounded-xl bg-emerald-700 font-semibold text-white disabled:opacity-60">
        {pending ? "저장 중..." : mode === "onboarding" ? "시작하기" : "저장"}
      </button>
    </form>
  );
}
