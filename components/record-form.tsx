"use client";

import { useActionState, useState } from "react";
import { createRecord, type ActionState } from "@/lib/actions";
import type { RecordTarget } from "@/lib/types";
import ActionMessage from "./action-message";
import TargetSelect from "./target-select";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 dark:border-sand-700";
const QUICK_MINUTES = [15, 30, 60, 120];

// 공부 기록 추가. 기록은 항상 자격증 아래에 쌓인다.
// fixedTarget을 주면(자격증 상세) 그 자격증에 고정하고, 아니면(자격증 목록) 준비 중인 자격증에서 고른다.
export default function RecordForm({
  targets,
  today,
  fixedTarget,
}: {
  targets: RecordTarget[];
  today: string;
  fixedTarget?: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createRecord, null);
  const [minutes, setMinutes] = useState("");

  if (!fixedTarget && targets.length === 0) {
    return <p className="text-sm text-sand-500">준비 중인 자격증이 없어요. 먼저 자격증을 추가해 주세요.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {fixedTarget ? (
        <input type="hidden" name="target" value={fixedTarget} />
      ) : (
        <label className="flex flex-col gap-1 text-sm font-medium">
          어떤 자격증을 공부했나요?
          <TargetSelect targets={targets} className={INPUT} />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium">
        날짜
        <input name="date" type="date" defaultValue={today} max={today} required className={INPUT} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        한 일
        <textarea
          name="content"
          required
          maxLength={200}
          rows={3}
          placeholder="예: 필기 기출 1회분 풀이"
          className="w-full rounded-xl border border-sand-300 bg-transparent p-3 dark:border-sand-700"
        />
        <span className="text-xs font-normal text-sand-500">부대명, 위치, 훈련 일정은 적지 마세요.</span>
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">걸린 시간 (선택)</legend>
        <div className="flex gap-2">
          {QUICK_MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(String(m))}
              className={`h-10 flex-1 rounded-full text-sm ${
                minutes === String(m)
                  ? "bg-army-700 text-white"
                  : "border border-sand-300 dark:border-sand-700"
              }`}
            >
              {m < 60 ? `${m}분` : `${m / 60}시간`}
            </button>
          ))}
        </div>
        <input
          name="minutes"
          type="number"
          inputMode="numeric"
          min={1}
          max={1440}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="직접 입력 (분)"
          className={`${INPUT} mt-2`}
        />
      </fieldset>

      <ActionMessage state={state} />

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-army-700 font-semibold text-white hover:bg-army-800 disabled:opacity-60"
      >
        {pending ? "저장 중..." : "기록하기"}
      </button>
    </form>
  );
}
