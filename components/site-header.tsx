"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";
import Logo from "./logo";
import RunningSoldier from "./running-soldier";

// 로그인 후 화면 상단 메뉴 (군복 올리브 바). 넓은 화면에서는 메뉴가 보이고, 휴대폰에서는 로고만 보인다.
export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b-4 border-khaki-300 bg-army-800 text-khaki-100 dark:bg-army-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Logo href="/dashboard" tone="dark" />
        <RunningSoldier />
        <nav className="hidden md:block">
          <ul className="flex items-center gap-1">
            {/* "기록 추가"는 강조 버튼이라 맨 오른쪽에 둔다 */}
            {[...NAV_ITEMS].sort((a, b) => Number(a.href === "/records/new") - Number(b.href === "/records/new")).map((item) => {
              const active = isActive(pathname, item.href);
              const isCta = item.href === "/records/new";
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold ${
                      isCta
                        ? "ml-2 bg-khaki-300 text-army-900 hover:bg-khaki-200"
                        : active
                          ? "bg-army-950/40 text-white"
                          : "text-khaki-200 hover:bg-army-700"
                    }`}
                  >
                    {isCta ? "+ 기록 추가" : item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
