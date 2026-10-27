"use client";

import { useActionState, useState } from "react";
import { deleteRecord, updateRecord, type ActionState } from "@/lib/actions";
import type { ActivityRecord, Goal } from "@/lib/types";
import ActionMessage from "./action-message";

const INPUT = "h-10 w-full rounded-lg border border-zinc-300 bg-transparent px-3 text-sm dark:border-zinc-700";

// 기록 한 건: 보기 ↔ 수정, 삭제 (목표 상세·대시보드 잔디 패널 공용)
export default function RecordItem({
  record,
  goals,
  today,
  showDate = true,
}: {
  record: ActivityRecord;
  goals: Pick<Goal, "id" | "title">[];
  today: string;
  showDate?: boolean;
}) {
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
      <form action={update} className="flex flex-col gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
        <input type="hidden" name="id" value={record.id} />
        <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
          <input name="content" defaultValue={record.content} required maxLength={200} aria-label="한 일" className={INPUT} />
          <input name="minutes" type="number" min={1} max={1440} defaultValue={record.minutes ?? ""} placeholder="분" aria-label="걸린 시간(분)" className={INPUT} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="date" type="date" defaultValue={record.date} max={today} required aria-label="날짜" className={INPUT} />
          <select name="goal_id" defaultValue={record.goal_id ?? ""} aria-label="목표" className={INPUT}>
            <option value="">목표 없이 기록</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <ActionMessage state={updateState?.ok ? null : updateState} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="h-10 rounded-lg px-4 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800">
            취소
          </button>
          <button type="submit" disabled={updating} className="h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-60">
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
          <p className="break-words">{record.content}</p>
          {showDate && <p className="text-xs text-zinc-500">{record.date.replaceAll("-", ".")}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm">
          {record.minutes && <span className="mr-2 text-zinc-500">{record.minutes}분</span>}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="h-9 rounded-lg px-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
