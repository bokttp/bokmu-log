import { redirect } from "next/navigation";

// 목표 화면은 자격증·공부로 나눴다 (PLAN.md 결정 기록). 예전 주소로 들어오면 공부 화면으로 보낸다.
export default function GoalsPage() {
  redirect("/study");
}
