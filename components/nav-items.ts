// 로그인 후 화면 메뉴 (상단 메뉴·하단 탭 공용)
export const NAV_ITEMS = [
  { href: "/dashboard", label: "홈", icon: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/goals", label: "목표", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" },
  { href: "/records/new", label: "기록 추가", icon: "M12 4v16M4 12h16" },
  { href: "/settings", label: "설정", icon: "M4 6h16M4 12h16M4 18h16" },
];

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
