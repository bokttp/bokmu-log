"use client";

import { useActionState, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { createCertExam, deleteCertExam, updateCertExam, type ActionState } from "@/lib/actions";
import { formatDday } from "@/lib/service";
import { EXAM_RESULT_LABELS, EXAM_STAGE_LABELS, type CertExam, type ExamResult, type ExamStage } from "@/lib/types";
import ActionMessage from "./action-message";

const INPUT = "h-11 w-full rounded-lg border border-sand-300 bg-transparent px-3 text-sm dark:border-sand-700";

// 시험 단계 목록 (필기 → 실기). 각 단계의 시험일·결과·점수를 그 자리에서 고친다.
export default function CertExams({ certificateId, exams, today }: { certificateId: string; exams: CertExam[]; today: string }) {
  return (
    <div className="flex flex-col gap-3">
      {exams.length === 0 ? (
        <p className="py-4 text-center text-sm text-sand-500">아직 시험 일정이 없어요.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {exams.map((e, i) => (
            <li key={e.id} className="flex gap-3">
              {/* 단계 번호와 잇는 선 */}
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    e.result === "pass" ? "bg-army-700 text-white dark:bg-khaki-300 dark:text-army-900" : "border-2 border-sand-300 text-sand-500 dark:border-sand-700"
                  }`}
                >
                  {e.result === "pass" ? "✓" : i + 1}
                </span>
                {i < exams.length - 1 && <span className="w-0.5 flex-1 bg-sand-200 dark:bg-sand-800" aria-hidden />}
              </div>
              <div className="min-w-0 flex-1 pb-2">
                <ExamRow exam={e} today={today} />
              </div>
            </li>
          ))}
        </ol>
      )}
      <AddExam certificateId={certificateId} defaultStage={exams.some((e) => e.stage === "written") ? "practical" : "written"} />
    </div>
  );
}

function ExamRow({ exam, today }: { exam: CertExam; today: string }) {
  const [editing, setEditing] = useState(false);
  const [updateState, update, updating] = useActionState<ActionState, FormData>(async (prev, form) => {
    const result = await updateCertExam(prev, form);
    if (result?.ok) setEditing(false);
    return result;
  }, null);
  const [deleteState, remove, deleting] = useActionState<ActionState, FormData>(deleteCertExam, null);
  const dday = exam.exam_date && exam.result === "pending" ? formatDday(differenceInCalendarDays(parseISO(exam.exam_date), parseISO(today))) : null;

  if (editing) {
    return (
      <form action={update} className="flex flex-col gap-2 rounded-xl bg-sand-50 p-3 dark:bg-sand-900">
        <input type="hidden" name="id" value={exam.id} />
        <input type="hidden" name="stage" value={exam.stage} />
        <p className="text-sm font-semibold">{EXAM_STAGE_LABELS[exam.stage]}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <input name="exam_date" type="date" defaultValue={exam.exam_date ?? ""} aria-label="시험일" className={INPUT} />
          <select name="result" defaultValue={exam.result} aria-label="결과" className={INPUT}>
            {(Object.keys(EXAM_RESULT_LABELS) as ExamResult[]).map((r) => (
              <option key={r} value={r}>
                {EXAM_RESULT_LABELS[r]}
              </option>
            ))}
          </select>
          <input name="score" type="number" inputMode="numeric" min={0} max={1000} defaultValue={exam.score ?? ""} placeholder="점수 (선택)" aria-label="점수" className={INPUT} />
        </div>
        <ActionMessage state={updateState?.ok ? null : updateState} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="h-10 rounded-lg px-4 text-sm hover:bg-sand-200 dark:hover:bg-sand-800">
            취소
          </button>
          <button type="submit" disabled={updating} className="h-10 rounded-lg bg-army-700 px-4 text-sm font-semibold text-white disabled:opacity-60">
            {updating ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {EXAM_STAGE_LABELS[exam.stage]}
            {dday && <span className="ml-2 text-sm text-army-700 dark:text-khaki-300">{dday}</span>}
          </p>
          <p className="text-sm text-sand-500">
            {exam.exam_date ? exam.exam_date.replaceAll("-", ".") : "시험일 미정"} · {EXAM_RESULT_LABELS[exam.result]}
            {exam.score !== null && ` · ${exam.score}점`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm">
          <button type="button" onClick={() => setEditing(true)} className="h-9 rounded-lg px-2 text-sand-600 hover:bg-sand-100 dark:text-sand-400 dark:hover:bg-sand-800">
            결과 입력
          </button>
          <form
            action={remove}
            onSubmit={(ev) => {
              if (!confirm("이 시험 일정을 지울까요? 되돌릴 수 없어요.")) ev.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={exam.id} />
            <button type="submit" disabled={deleting} className="h-9 rounded-lg px-2 text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950">
              삭제
            </button>
          </form>
        </div>
      </div>
      <ActionMessage state={deleteState ?? (updateState?.ok ? updateState : null)} />
    </div>
  );
}

function AddExam({ certificateId, defaultStage }: { certificateId: string; defaultStage: ExamStage }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(createCertExam, null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-xl border border-dashed border-sand-300 text-sm font-semibold text-army-700 hover:bg-sand-50 dark:border-sand-700 dark:text-khaki-300 dark:hover:bg-sand-900">
        + 시험 일정 추가
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 rounded-xl bg-sand-50 p-3 dark:bg-sand-900">
      <input type="hidden" name="certificate_id" value={certificateId} />
      <div className="grid gap-2 sm:grid-cols-2">
        <select name="stage" defaultValue={defaultStage} aria-label="시험 단계" className={INPUT}>
          {(Object.keys(EXAM_STAGE_LABELS) as ExamStage[]).map((s) => (
            <option key={s} value={s}>
              {EXAM_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        <input name="exam_date" type="date" aria-label="시험일" className={INPUT} />
      </div>
      <ActionMessage state={state} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg px-4 text-sm hover:bg-sand-200 dark:hover:bg-sand-800">
          닫기
        </button>
        <button type="submit" disabled={pending} className="h-10 rounded-lg bg-army-700 px-4 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "저장 중..." : "추가"}
        </button>
      </div>
    </form>
  );
}
