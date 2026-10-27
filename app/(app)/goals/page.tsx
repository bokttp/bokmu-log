import { redirect } from "next/navigation";

// 목표 화면은 자격증으로 바꿨다 (PLAN.md 결정 기록). 예전 주소로 들어오면 자격증 화면으로 보낸다.
export default function GoalsPage() {
  redirect("/certificates");
}
