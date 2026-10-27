"use client";

import { useActionState, useState } from "react";
import { deleteRecord, updateRecord, type ActionState } from "@/lib/actions";
import type { ActivityRecord, RecordTarget } from "@/lib/types";
import ActionMessage from "./action-message";
import TargetSelect from "./target-select";

const INPUT = "h-10 w-full rounded-lg border border-sand-300 bg-transparent px-3 text-sm dark:border-sand-700";

// 공부 기록 한 건: 보기 ↔ 수정, 삭제 (공부·과목·자격증 상세, 대시보드 잔디 패널 공용)
// targetName은 기록이 붙은 과목·자격증 이름. showTarget이면 내용 앞에 태그로 보여준다 (상세 화면에서는 숨긴다).
export default function RecordItem({
  record,
  targets,
  today,
  showDate = true,
  targetName,
  showTarget = true,
}: {
  record: ActivityRecord;
  targets: RecordTarget[];
  today: string;
  showDate?: boolean;
  targetName?: string | null;
  showTarget?: boolean;
}) {
  const targetLabel = showTarget ? targetName : null;
  const currentTarget = record.subject_id ? `s:${record.subject_id}` : record.certificate_id ? `c:${record.certificate_id}` : "";
  // 보관·취득한 곳에 붙은 기록도 고칠 수 있게, 현재 연결된 곳을 목록에 넣어 둔다
  const editTargets =
    currentTarget && !targets.some((t) => t.key === currentTarget)
      ? [...targets, { key: currentTarget, name: targetName ?? "현재 연결된 곳", type: record.subject_id ? ("subject" as const) : ("certificate" as const) }]
      : targets;
  const [editing, setEditing] = useState(false);
  // 저장에 성공하면 보기 모드로 돌아간다
  const [updateState, update, updating] = useActionState<ActionState, FormData>(async (prev, form) => {
    const result = await updateRecord(prev, form);
    if (result?.ok) setEditing(false);
    return result;
  }, null);
  const [deleteState, remove, deleting] = useActionState<ActionState, FormData>(deleteRecord, null);

  if (editing) {
    return (
      <form action={update} className="flex flex-col gap-2 rounded-xl bg-sand-50 p-3 dark:bg-sand-900">
        <input type="hidden" name="id" value={record.id} />
        <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
          <input name="content" defaultValue={record.content} required maxLength={200} aria-label="한 일" className={INPUT} />
          <input name="minutes" type="number" min={1} max={1440} defaultValue={record.minutes ?? ""} placeholder="분" aria-label="걸린 시간(분)" className={INPUT} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="date" type="date" defaultValue={record.date} max={today} required aria-label="날짜" className={INPUT} />
          <TargetSelect targets={editTargets} defaultValue={currentTarget} className={INPUT} />
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
      <div className="group flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words">
            {targetLabel && (
              <span className="mr-2 rounded bg-khaki-200 px-1.5 py-0.5 text-xs font-semibold text-army-900 dark:bg-army-800 dark:text-khaki-200">
                {targetLabel}
              </span>
            )}
            {record.content}
          </p>
          {showDate && <p className="text-xs text-sand-500">{record.date.replaceAll("-", ".")}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm">
          {record.minutes && <span className="mr-2 text-sand-500">{record.minutes}분</span>}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="h-9 rounded-lg px-2 text-sand-600 hover:bg-sand-100 dark:text-sand-400 dark:hover:bg-sand-800"
          >
            수정
          </button>
          <form
            action={remove}
            onSubmit={(e) => {
              if (!confirm("이 기록을 지울까요? 되돌릴 수 없어요.")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={record.id} />
            <button
              type="submit"
              disabled={deleting}
              className="h-9 rounded-lg px-2 text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950"
            >
              {deleting ? "지우는 중" : "삭제"}
            </button>
          </form>
        </div>
      </div>
      {/* 삭제를 했다면 삭제 결과를, 아니면 방금 저장한 결과를 보여준다 */}
      <ActionMessage state={deleteState ?? (updateState?.ok ? updateState : null)} />
    </div>
  );
}
