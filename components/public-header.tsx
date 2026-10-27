import Logo from "./logo";

// 로그인 전 화면(랜딩·로그인·온보딩·처리방침) 상단 바. 로그인 후 헤더와 같은 올리브 바.
export default function PublicHeader({ right, maxWidth = "max-w-6xl" }: { right?: React.ReactNode; maxWidth?: string }) {
  return (
    <header className="border-b-4 border-khaki-300 bg-army-800 dark:bg-army-950">
      <div className={`mx-auto flex h-16 ${maxWidth} items-center justify-between px-4 md:px-8`}>
        <Logo tone="dark" />
        {right}
      </div>
    </header>
  );
}
