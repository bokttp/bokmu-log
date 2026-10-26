"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";

// 로그인 후 화면 상단 메뉴. 넓은 화면에서는 메뉴가 보이고, 휴대폰에서는 로고만 보인다.
export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/dashboard" className="text-lg font-bold text-emerald-800 dark:text-emerald-400">
          복무로그
        </Link>
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
                    className={`inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium ${
                      isCta
                        ? "ml-2 bg-emerald-700 text-white hover:bg-emerald-800"
                        : active
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                          : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
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
