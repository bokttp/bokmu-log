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
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">목표</h1>
        <p className="mt-1 text-sm text-sand-500">
          진행 중 {goals.filter((g) => g.status === "in_progress").length}개 · 완료{" "}
          {goals.filter((g) => g.status === "done").length}개
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <section className="flex flex-col gap-4">
          <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            {chips.map((c) => (
              <Link
                key={c.label}
                href={c.key ? `/goals?category=${c.key}` : "/goals"}
                className={`inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm ${
                  selected === c.key
                    ? "bg-army-800 font-semibold text-khaki-100 dark:bg-khaki-300 dark:text-army-900"
                    : "border border-sand-300 hover:bg-sand-50 dark:border-sand-700 dark:hover:bg-sand-900"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {shown.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sand-300 py-16 text-center text-sm text-sand-500 dark:border-sand-700">
              아직 목표가 없어요. 첫 목표를 만들어 보세요.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {shown.map((g) => (
                <GoalCard key={g.id} goal={g} today={today} />
              ))}
            </div>
          )}
        </section>

        {/* 넓은 화면에서는 오른쪽에 고정되는 추가 패널 */}
        <aside className="order-first lg:sticky lg:top-24 lg:order-none">
          <GoalForm />
        </aside>
      </div>
    </main>
  );
}
