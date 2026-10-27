// 목표·독서·체력검정이 함께 쓰는 화면 틀: 제목 + 요약 3칸, 왼쪽 본문 + 오른쪽 추가 패널, 공통 패널 상자

export function PageHeader({
  title,
  description,
  stats,
}: {
  title: string;
  description?: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <header className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-sand-500">{description}</p>}
      </div>
      <dl className="grid grid-cols-3 gap-2 md:gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-sand-200 bg-white/80 px-3 py-3 shadow-sm md:px-5 md:py-4 dark:border-sand-800 dark:bg-sand-900/60">
            <dt className="text-xs text-sand-600 md:text-sm dark:text-sand-400">{s.label}</dt>
            <dd className="mt-1 text-lg font-bold text-army-800 md:text-2xl dark:text-khaki-200">{s.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

// 넓은 화면: 왼쪽 본문 + 오른쪽 고정 패널(추가 폼, 관련 목표). 휴대폰: 패널이 위로 온다.
export function TwoColumn({ children, aside }: { children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
      <aside className="order-first flex flex-col gap-4 lg:sticky lg:top-24 lg:order-none">{aside}</aside>
    </div>
  );
}

export function Panel({
  title,
  action,
  className = "",
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <span className="h-3 w-1.5 rounded-sm bg-khaki-400" aria-hidden />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-sand-300 py-12 text-center text-sm text-sand-500 dark:border-sand-700">
      {children}
    </p>
  );
}
