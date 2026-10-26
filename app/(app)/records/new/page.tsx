import { getGoals } from "@/lib/data";
import { todayKST } from "@/lib/service";
import RecordForm from "@/components/record-form";

export const instant = false; // layout.tsx 참고

export default async function NewRecordPage({ searchParams }: PageProps<"/records/new">) {
  const { goal } = await searchParams;
  const goals = (await getGoals()).filter((g) => g.status === "in_progress");
  const defaultGoalId = typeof goal === "string" && goals.some((g) => g.id === goal) ? goal : "";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">기록 추가</h1>
        <p className="mt-1 text-sm text-zinc-500">오늘 한 자기계발을 짧게 남겨 보세요.</p>
      </header>
      <div className="rounded-2xl border border-zinc-200 p-5 md:p-8 dark:border-zinc-800">
        <RecordForm goals={goals} today={todayKST()} defaultGoalId={defaultGoalId} />
      </div>
    </main>
  );
}
