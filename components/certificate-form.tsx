"use client";

import { useActionState } from "react";
import { createCertificate, type ActionState } from "@/lib/actions";
import { CERT_KIND_LABELS, EXAM_STAGE_LABELS, type CertKind, type ExamStage } from "@/lib/types";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 dark:border-sand-700";

// 자격증 추가. 첫 시험일을 알면 함께 적고, 나머지 시험 단계는 상세 화면에서 더한다.
export default function CertificateForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createCertificate, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        자격증 이름
        <input name="name" required maxLength={60} placeholder="예: 정보처리기사" className={INPUT} />
      </label>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">종류</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CERT_KIND_LABELS) as CertKind[]).map((k, i) => (
            <label key={k} className="cursor-pointer">
              <input type="radio" name="kind" value={k} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-flex h-10 items-center rounded-full border border-sand-300 px-4 text-sm peer-checked:border-army-700 peer-checked:bg-army-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-army-500 dark:border-sand-700">
                {CERT_KIND_LABELS[k]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-medium">
        시행기관 (선택)
        <input name="issuer" maxLength={40} placeholder="예: 한국산업인력공단" className={INPUT} />
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-medium">첫 시험 (선택)</legend>
        <div className="grid grid-cols-[110px_1fr] gap-2">
          <select name="stage" defaultValue="written" aria-label="시험 단계" className={INPUT}>
            {(Object.keys(EXAM_STAGE_LABELS) as ExamStage[]).map((s) => (
              <option key={s} value={s}>
                {EXAM_STAGE_LABELS[s]}
              </option>
            ))}
          </select>
          <input name="exam_date" type="date" aria-label="시험일" className={INPUT} />
        </div>
        <span className="text-xs text-sand-500">필기·실기가 나뉘지 않으면 &quot;시험&quot;을 고르세요.</span>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-medium">
        메모 (선택)
        <textarea name="memo" maxLength={500} rows={2} placeholder="예: 기출 10회분 풀기" className="w-full rounded-xl border border-sand-300 bg-transparent p-3 dark:border-sand-700" />
      </label>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="h-12 rounded-xl bg-army-700 font-semibold text-white hover:bg-army-800 disabled:opacity-60">
        {pending ? "저장 중..." : "추가"}
      </button>
    </form>
  );
}
