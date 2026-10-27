import type { ActionState } from "@/lib/actions";

// 서버 액션 결과 한 줄 안내
export default function ActionMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p
      role="status"
      className={`rounded-lg p-3 text-sm ${
        state.ok
          ? "bg-army-50 text-army-800 dark:bg-army-950 dark:text-army-200"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      }`}
    >
      {state.message}
    </p>
  );
}
