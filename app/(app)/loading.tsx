// 로그인 후 화면 공통 로딩 스켈레톤. 페이지를 Suspense로 감싸는 역할도 한다 (Cache Components).
export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="불러오는 중">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-sand-100 dark:bg-sand-900" />
      <div className="h-36 animate-pulse rounded-2xl bg-sand-100 dark:bg-sand-900" />
      <div className="h-20 animate-pulse rounded-2xl bg-sand-100 dark:bg-sand-900" />
      <div className="h-28 animate-pulse rounded-2xl bg-sand-100 dark:bg-sand-900" />
    </div>
  );
}
