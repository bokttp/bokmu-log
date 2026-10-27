import type { Metadata, Viewport } from "next";
import { Black_Ops_One, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

// 본문: IBM Plex Sans KR (단단하고 정돈된 느낌의 한글 글꼴)
const plexKr = IBM_Plex_Sans_KR({
  variable: "--font-plex-kr",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  preload: false, // 한글 글리프는 subset 지정이 없어 미리 불러오지 않는다
});

// D-day·로고 숫자: 스텐실 글꼴 (군용 장비 표기 느낌, 영문·숫자 전용)
const blackOps = Black_Ops_One({
  variable: "--font-black-ops",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "복무로그",
  description: "복무 기간 동안의 자기계발을 기록하고, 전역할 때 한눈에 돌아보세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4b5320",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${plexKr.variable} ${blackOps.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
