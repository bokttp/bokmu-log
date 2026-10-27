import { redirect } from "next/navigation";

// 기록 추가는 공부·자격증 화면 안에 있다. 예전 주소로 들어오면 공부 화면으로 보낸다.
export default function NewRecordPage() {
  redirect("/study");
}
