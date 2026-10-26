import Link from "next/link";

const FEATURES = [
  { title: "전역 D-day", body: "입대일만 넣으면 전역일, 복무율, 다음 진급 예상일을 매일 보여줘요." },
  { title: "목표 관리", body: "자격증, 독서, 운동, 공부 목표를 세우고 목표일까지 남은 날을 확인해요." },
  { title: "기록 잔디", body: "하루하루 쌓은 기록을 12주 잔디로 한눈에 보고, 날짜별로 돌아봐요." },
];

// 미리보기 카드의 잔디 모양 (장식용 고정 패턴)
const PREVIEW_GRASS = [0, 2, 1, 3, 0, 1, 2, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 1, 2, 3, 1];
const GRASS_CLASS = ["bg-white/15", "bg-emerald-300/60", "bg-emerald-300/80", "bg-white"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <span className="text-lg font-bold text-emerald-800 dark:text-emerald-400">복무로그</span>
          <Link href="/login" className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">
            로그인
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 md:px-8 md:py-20">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">장병 자기계발 기록</p>
            <h1 className="mt-3 text-4xl leading-tight font-bold md:text-5xl">
              전역할 때,
              <br />
              내가 해낸 것을 보여줄 수 있도록
            </h1>
            <p className="mt-5 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
              복무 기간 동안의 자격증, 독서, 운동, 공부를 기록하고 남은 시간 안에 무엇을 해낼지 매일 확인하세요.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex h-12 items-center rounded-xl bg-emerald-700 px-6 font-semibold text-white hover:bg-emerald-800">
                무료로 시작하기
              </Link>
              <a href="#features" className="inline-flex h-12 items-center rounded-xl border border-zinc-300 px-6 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
                기능 보기
              </a>
            </div>
          </div>

          {/* 대시보드 미리보기 (예시 화면) */}
          <div aria-hidden className="rounded-3xl bg-emerald-800 p-8 text-white shadow-xl">
            <p className="text-sm text-emerald-100">육군 · 전역까지</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-6xl font-bold tracking-tight">D-328</p>
              <p className="text-3xl font-semibold">40.1%</p>
            </div>
            <div className="mt-6 h-3 rounded-full bg-emerald-950/50">
              <div className="h-full w-2/5 rounded-full bg-white" />
            </div>
            <div className="mt-8 grid grid-cols-7 gap-1.5">
              {PREVIEW_GRASS.map((l, i) => (
                <span key={i} className={`aspect-square rounded ${GRASS_CLASS[l]}`} />
              ))}
            </div>
            <p className="mt-3 text-sm text-emerald-100">이번 달 기록 29건 · 20.3시간</p>
          </div>
        </section>

        <section id="features" className="mt-24 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
              <p className="text-lg font-semibold">{f.title}</p>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        부대명, 위치, 훈련 일정 같은 군사 정보는 기록하지 마세요.
      </footer>
    </div>
  );
}
