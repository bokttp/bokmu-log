import { getGoals } from "@/lib/data";
import { todayKST } from "@/lib/service";
import RecordForm from "@/components/record-form";

export const instant = false; // layout.tsx 참고

export default async function NewRecordPage({ searchParams }: PageProps<"/records/new">) {
  const { goal } = await searchParams;
  const goals = (await getGoals()).filter((g) => g.status === "in_progress");
  const defaultGoalId = typeof goal === "string" && goals.some((g) => g.id === goal) ? goal : "";

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">기록 추가</h1>
      <RecordForm goals={goals} today={todayKST()} defaultGoalId={defaultGoalId} />
    </main>
  );
}
