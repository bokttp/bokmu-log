import { redirect } from "next/navigation";

// 공부 화면은 자격증과 겹쳐서 없앴다 (PLAN.md 결정 기록). 공부 기록은 자격증 화면에 있다.
export default function StudyPage() {
  redirect("/certificates");
}
