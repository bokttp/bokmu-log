import Link from "next/link";
import { getGoals } from "@/lib/data";
import { todayKST } from "@/lib/service";
import { CATEGORY_LABELS, type GoalCategory } from "@/lib/types";
import GoalCard from "@/components/goal-card";
import GoalForm from "@/components/goal-form";

export const instant = false; // layout.tsx 참고

export default async function GoalsPage({ searchParams }: PageProps<"/goals">) {
  const { category } = await searchParams;
  const goals = await getGoals();
  const today = todayKST();
  const selected = typeof category === "string" && category in CATEGORY_LABELS ? (category as GoalCategory) : null;
  const shown = selected ? goals.filter((g) => g.category === selected) : goals;

  const chips: { key: GoalCategory | null; label: string }[] = [
    { key: null, label: "전체" },
    ...(Object.entries(CATEGORY_LABELS) as [GoalCategory, string][]).map(([key, label]) => ({ key, label })),
  ];

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">목표</h1>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {chips.map((c) => (
          <Link
            key={c.label}
            href={c.key ? `/goals?category=${c.key}` : "/goals"}
            className={`inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm ${
              selected === c.key
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <GoalForm />

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">아직 목표가 없어요. 첫 목표를 만들어 보세요.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((g) => (
            <GoalCard key={g.id} goal={g} today={today} />
          ))}
        </div>
      )}
    </main>
  );
}
