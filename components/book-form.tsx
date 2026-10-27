"use client";

import { useActionState } from "react";
import { createBook, type ActionState } from "@/lib/actions";
import ActionMessage from "./action-message";

const INPUT = "h-12 w-full rounded-xl border border-sand-300 bg-transparent px-4 dark:border-sand-700";

// 책 추가 (F-08). 완독일을 비우면 "읽는 중"으로 저장된다.
export default function BookForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createBook, null);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
      <h2 className="font-semibold">책 추가</h2>
      <label className="flex flex-col gap-1 text-sm font-medium">
        제목
        <input name="title" required maxLength={100} placeholder="예: 아주 작은 습관의 힘" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        저자 (선택)
        <input name="author" maxLength={60} className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        완독일 (읽는 중이면 비워 두세요)
        <input name="finished_on" type="date" max={today} className={INPUT} />
      </label>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">별점 (선택)</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="rating" value={n} className="peer sr-only" />
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-sand-300 text-sm peer-checked:border-army-700 peer-checked:bg-army-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-army-500 dark:border-sand-700">
                {n}점
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-medium">
        한줄평 (선택)
        <input name="review" maxLength={100} placeholder="100자까지" className={INPUT} />
      </label>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="h-12 rounded-xl bg-army-700 font-semibold text-white hover:bg-army-800 disabled:opacity-60">
        {pending ? "저장 중..." : "추가"}
      </button>
    </form>
  );
}
