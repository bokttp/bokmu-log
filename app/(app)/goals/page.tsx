import Link from "next/link";
import { connection } from "next/server";
import { getGoals, getRecordsSince } from "@/lib/data";
import { todayKST } from "@/lib/service";
import { CATEGORY_LABELS, type GoalCategory } from "@/lib/types";
import GoalCard from "@/components/goal-card";
import GoalForm from "@/components/goal-form";
import RecordForm from "@/components/record-form";
import AddPanel from "@/components/add-panel";
import { EmptyState, PageHeader, TwoColumn } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

export default async function GoalsPage({ searchParams }: PageProps<"/goals">) {
  await connection();
  const { category } = await searchParams;
  const today = todayKST();
  const [goals, monthRecords] = await Promise.all([getGoals(), getRecordsSince(`${today.slice(0, 7)}-01`)]);
  const selected = typeof category === "string" && category in CATEGORY_LABELS ? (category as GoalCategory) : null;
  const shown = selected ? goals.filter((g) => g.category === selected) : goals;
  const active = goals.filter((g) => g.status === "in_progress");
  const monthMinutes = monthRecords.reduce((sum, r) => sum + (r.minutes ?? 0), 0);

  const chips: { key: GoalCategory | null; label: string }[] = [
    { key: null, label: "전체" },
    ...(Object.entries(CATEGORY_LABELS) as [GoalCategory, string][]).map(([key, label]) => ({ key, label })),
  ];

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="목표"
        description="목표를 세우고, 한 일은 목표 아래에 기록해요."
        stats={[
          { label: "진행 중", value: `${active.length}개` },
          { label: "완료", value: `${goals.filter((g) => g.status === "done").length}개` },
          { label: `${Number(today.slice(5, 7))}월 기록`, value: `${Math.round((monthMinutes / 60) * 10) / 10}시간` },
        ]}
      />

      <TwoColumn
        aside={
          <>
            <AddPanel label="기록 추가">
              <RecordForm goals={active} today={today} />
            </AddPanel>
            <AddPanel label="목표 추가" variant="outline">
              <GoalForm />
            </AddPanel>
          </>
        }
      >
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
          <EmptyState>아직 목표가 없어요. 첫 목표를 만들어 보세요.</EmptyState>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {shown.map((g) => (
              <GoalCard key={g.id} goal={g} today={today} />
            ))}
          </div>
        )}
      </TwoColumn>
    </main>
  );
}
