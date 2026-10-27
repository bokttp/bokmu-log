// 로그인 후 화면 메뉴. 상단 메뉴(넓은 화면)는 전부, 하단 탭(휴대폰)은 4칸만 보이고 나머지는 "더보기"에 모은다.
export const NAV_ITEMS = [
  { href: "/dashboard", label: "홈", icon: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/goals", label: "목표", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" },
  { href: "/books", label: "독서", icon: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7" },
  { href: "/fitness", label: "체력", icon: "M3 17l5-6 4 4 7-9M14 6h5v5" },
  { href: "/savings", label: "적금", icon: "M4 7h16v12H4zM4 11h16M8 15h3" },
  { href: "/records/new", label: "기록 추가", icon: "M12 4v16M4 12h16" },
  { href: "/settings", label: "설정", icon: "M4 6h16M4 12h16M4 18h16" },
];

// "더보기" 탭에 모으는 화면
export const MORE_HREFS = ["/books", "/fitness", "/savings", "/settings"];

export const MOBILE_ITEMS = [
  ...NAV_ITEMS.filter((item) => !MORE_HREFS.includes(item.href)),
  { href: "/more", label: "더보기", icon: "M4.5 12h1.5M11.25 12h1.5M18 12h1.5" },
];

export const isActive = (pathname: string, href: string) =>
  pathname === href ||
  pathname.startsWith(`${href}/`) ||
  (href === "/more" && MORE_HREFS.some((h) => pathname === h || pathname.startsWith(`${h}/`)));
