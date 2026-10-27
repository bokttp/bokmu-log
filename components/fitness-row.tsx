"use client";

import { useState } from "react";
import { deleteFitnessTest } from "@/lib/actions";
import { formatRun } from "@/lib/fitness";
import type { FitnessTest } from "@/lib/types";
import DeleteRowButton from "./delete-row-button";
import FitnessForm from "./fitness-form";

// 체력검정 기록표 한 줄: 보기 ↔ 수정(같은 자리에 폼), 삭제
export default function FitnessRow({ test, today }: { test: FitnessTest; today: string }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="py-3">
          <div className="max-w-md rounded-xl bg-sand-50 p-4 dark:bg-sand-900">
            <FitnessForm today={today} test={test} onDone={() => setEditing(false)} />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="py-2">{test.tested_on.replaceAll("-", ".")}</td>
      <td className="py-2">{test.pushups !== null ? `${test.pushups}회` : "-"}</td>
      <td className="py-2">{test.situps !== null ? `${test.situps}회` : "-"}</td>
      <td className="py-2">{test.run_seconds !== null ? formatRun(test.run_seconds) : "-"}</td>
      <td className="py-1 text-right">
        <div className="flex items-start justify-end">
          <button type="button" onClick={() => setEditing(true)} className="h-11 rounded-lg px-3 text-sm text-sand-600 hover:bg-sand-100 dark:text-sand-400 dark:hover:bg-sand-800">
            수정
          </button>
          <DeleteRowButton id={test.id} action={deleteFitnessTest} confirmText="이 체력검정 기록을 지울까요? 되돌릴 수 없어요." />
        </div>
      </td>
    </tr>
  );
}
