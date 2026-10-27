import { redirect } from "next/navigation";

export const instant = false; // layout.tsx 참고

// 기록 추가는 목표 화면으로 옮겼다. 예전 주소로 들어오면 목표(또는 그 목표 상세)로 보낸다.
export default async function NewRecordPage({ searchParams }: PageProps<"/records/new">) {
  const { goal } = await searchParams;
  redirect(typeof goal === "string" && goal ? `/goals/${encodeURIComponent(goal)}` : "/goals");
}
