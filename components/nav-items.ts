// 로그인 후 화면 메뉴. 기록 추가는 공부·자격증 화면 안에 있다.
// 상단 메뉴(넓은 화면)는 전부, 하단 탭(휴대폰)은 홈·자격증·공부·독서 + "더보기"(체력·적금·설정).
export const NAV_ITEMS = [
  { href: "/dashboard", label: "홈", icon: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/certificates", label: "자격증", icon: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" },
  { href: "/study", label: "공부", icon: "M4 19V6a2 2 0 0 1 2-2h12v13H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 8h6M9 11h4" },
  { href: "/books", label: "독서", icon: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7" },
  { href: "/fitness", label: "체력", icon: "M3 17l5-6 4 4 7-9M14 6h5v5" },
  { href: "/savings", label: "적금", icon: "M4 7h16v12H4zM4 11h16M8 15h3" },
  { href: "/settings", label: "설정", icon: "M4 6h16M4 12h16M4 18h16" },
];

// "더보기" 탭에 모으는 화면
export const MORE_HREFS = ["/fitness", "/savings", "/settings"];

export const MOBILE_ITEMS = [
  ...NAV_ITEMS.filter((item) => !MORE_HREFS.includes(item.href)),
  { href: "/more", label: "더보기", icon: "M4.5 12h1.5M11.25 12h1.5M18 12h1.5" },
];

export const isActive = (pathname: string, href: string) =>
  pathname === href ||
  pathname.startsWith(`${href}/`) ||
  (href === "/more" && MORE_HREFS.some((h) => pathname === h || pathname.startsWith(`${h}/`)));
