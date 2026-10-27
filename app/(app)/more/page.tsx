import Link from "next/link";
import { MORE_HREFS, NAV_ITEMS } from "@/components/nav-items";

export const instant = false; // layout.tsx 참고

const INFO: Record<string, { title: string; desc: string }> = {
  "/books": { title: "독서", desc: "읽은 책과 별점, 한줄평" },
  "/fitness": { title: "체력검정", desc: "팔굽혀펴기·윗몸일으키기·3km 기록과 그래프" },
  "/savings": { title: "적금 계산기", desc: "장병내일준비적금 만기 금액 계산" },
  "/settings": { title: "설정", desc: "프로필, 비밀번호, 로그아웃, 탈퇴" },
};

// 휴대폰 하단 탭의 "더보기". 넓은 화면에서는 상단 메뉴에 모두 보인다.
export default function MorePage() {
  const items = NAV_ITEMS.filter((item) => MORE_HREFS.includes(item.href));

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold md:text-3xl">더보기</h1>
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm hover:bg-sand-50 dark:border-sand-800 dark:bg-sand-900/60 dark:hover:bg-sand-900"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-army-800 text-khaki-200">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={item.icon} />
                </svg>
              </span>
              <span>
                <span className="block font-semibold">{INFO[item.href].title}</span>
                <span className="text-sm text-sand-500">{INFO[item.href].desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
