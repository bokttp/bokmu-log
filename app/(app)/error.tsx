"use client";

import { useEffect } from "react";

// 로그인 후 화면 공통 오류 화면 (명세 4.3: 한 줄 메시지 + "다시 시도")
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-sand-200 bg-white/80 shadow-sm dark:bg-sand-900/60 px-6 py-16 text-center dark:border-sand-800">
      <p className="font-semibold">화면을 불러오지 못했어요.</p>
      <p className="text-sm text-sand-500">잠시 후 다시 시도해 주세요. 계속되면 새로고침해 주세요.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="h-12 rounded-xl bg-army-700 px-6 font-semibold text-white hover:bg-army-800"
      >
        다시 시도
      </button>
    </div>
  );
}
