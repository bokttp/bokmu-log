"use client";

import { useState } from "react";

// 오른쪽 패널의 "+ 추가" 버튼. 누르면 같은 자리에 폼이 펼쳐진다 (목표·기록·책·체력검정 공용).
export default function AddPanel({
  label,
  variant = "primary",
  children,
}: {
  label: string;
  variant?: "primary" | "outline";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-12 w-full items-center justify-center rounded-xl font-semibold ${
          variant === "primary"
            ? "bg-army-700 text-white hover:bg-army-800"
            : "border border-army-700 text-army-700 hover:bg-army-50 dark:border-khaki-300 dark:text-khaki-300 dark:hover:bg-army-950"
        }`}
      >
        + {label}
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <span className="h-3 w-1.5 rounded-sm bg-khaki-400" aria-hidden />
          {label}
        </h2>
        <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-lg px-3 text-sm text-sand-600 hover:bg-sand-100 dark:text-sand-400 dark:hover:bg-sand-800">
          닫기
        </button>
      </div>
      {children}
    </section>
  );
}
