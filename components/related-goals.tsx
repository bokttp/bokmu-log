import Link from "next/link";
import type { Goal, GoalCategory } from "@/lib/types";
import GoalCard from "./goal-card";
import { Panel } from "./page-frame";

// 독서·체력검정 화면 오른쪽의 "관련 목표": 같은 카테고리의 진행 중 목표를 보여 목표 화면과 잇는다
export default function RelatedGoals({
  goals,
  category,
  today,
  emptyText,
}: {
  goals: Goal[];
  category: GoalCategory;
  today: string;
  emptyText: string;
}) {
  const related = goals.filter((g) => g.category === category && g.status === "in_progress");

  return (
    <Panel
      title="관련 목표"
      action={
        <Link href={`/goals?category=${category}`} className="text-sm text-army-700 hover:underline dark:text-khaki-300">
          전체 보기
        </Link>
      }
    >
      {related.length === 0 ? (
        <Link href="/goals" className="block rounded-xl border border-dashed border-sand-300 p-4 text-center text-sm dark:border-sand-700">
          {emptyText} →
        </Link>
      ) : (
        <div className="flex flex-col gap-2">
          {related.slice(0, 3).map((g) => (
            <GoalCard key={g.id} goal={g} today={today} />
          ))}
        </div>
      )}
    </Panel>
  );
}
