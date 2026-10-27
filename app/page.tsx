import Link from "next/link";
import { Suspense } from "react";
import PublicHeader from "@/components/public-header";
import RankBadge from "@/components/rank-badge";

const FEATURES = [
  { no: "01", title: "전역 D-day", body: "입대일만 넣으면 전역일, 복무율, 다음 진급 예상일을 매일 보여줘요." },
  { no: "02", title: "자격증", body: "시험 일정과 결과, 자격증별 공부 시간을 한곳에서 관리해요." },
  { no: "03", title: "기록 잔디", body: "하루하루 쌓은 기록을 12주 잔디로 한눈에 보고, 날짜별로 돌아봐요." },
];

// 미리보기 카드의 잔디 모양 (장식용 고정 패턴)
const PREVIEW_GRASS = [0, 2, 1, 3, 0, 1, 2, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 1, 2, 3, 1];
const GRASS_CLASS = ["bg-army-950/50", "bg-khaki-300/40", "bg-khaki-300/70", "bg-khaki-300"];

// 탈퇴 후 /?bye=1 로 오면 안내를 띄운다 (searchParams는 Suspense 안에서 읽는다)
async function ByeNotice({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { bye } = await searchParams;
  if (!bye) return null;
  return (
    <p className="mx-auto mt-6 max-w-6xl rounded-xl bg-sand-100 p-4 text-sm text-sand-700 dark:bg-sand-900 dark:text-sand-300">
      탈퇴가 끝났어요. 계정과 모든 기록을 지웠어요. 그동안 고생 많으셨어요.
    </p>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <PublicHeader
        right={
          <Link href="/login" className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-khaki-100 hover:bg-army-700">
            로그인
          </Link>
        }
      />

      {/* 히어로: 위장 무늬 올리브 띠 */}
      <section className="relative overflow-hidden bg-army-700 text-khaki-100 dark:bg-army-900">
        <div className="camo pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded bg-khaki-300 px-2 py-1 text-xs font-bold text-army-900">
              장병 자기계발 기록
            </p>
            <h1 className="mt-4 text-4xl leading-tight font-bold md:text-5xl">
              전역할 때,
              <br />
              내가 해낸 것을 보여줄 수 있도록
            </h1>
            <p className="mt-5 max-w-lg text-lg text-khaki-200">
              복무 기간 동안의 자격증, 독서, 운동, 공부를 기록하고 남은 시간 안에 무엇을 해낼지 매일 확인하세요.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex h-12 items-center rounded-xl bg-khaki-300 px-6 font-bold text-army-900 hover:bg-khaki-200">
                무료로 시작하기
              </Link>
              <a href="#features" className="inline-flex h-12 items-center rounded-xl border border-khaki-300/60 px-6 font-semibold text-khaki-100 hover:bg-army-800">
                기능 보기
              </a>
            </div>
          </div>

          {/* 대시보드 미리보기 (예시 화면) */}
          <div aria-hidden className="rounded-2xl border border-khaki-300/40 bg-army-900/80 p-7 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-khaki-200">
                  <span className="rounded bg-khaki-300 px-1.5 py-0.5 text-xs font-bold text-army-900">육군</span>
                  전역까지
                </p>
                <p className="mt-2 font-stencil text-6xl tracking-wide">D-328</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RankBadge rank="일병" />
                <span className="text-xs font-semibold text-khaki-200">일병</span>
              </div>
            </div>
            <div className="mt-6 flex items-baseline justify-between text-sm">
              <span className="text-khaki-200">복무율</span>
              <span className="font-stencil text-2xl">40.1%</span>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded bg-army-950/60 ring-1 ring-khaki-300/30">
              <div className="h-full w-2/5 bg-khaki-300" />
            </div>
            <div className="mt-7 grid grid-cols-7 gap-1.5">
              {PREVIEW_GRASS.map((l, i) => (
                <span key={i} className={`aspect-square rounded-sm ${GRASS_CLASS[l]}`} />
              ))}
            </div>
            <p className="mt-3 text-sm text-khaki-200">이번 달 기록 29건 · 20.3시간</p>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <ByeNotice searchParams={searchParams} />
      </Suspense>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 md:px-8 md:py-20">
        <section id="features" className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-sand-200 bg-white/80 p-6 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
              <p className="font-stencil text-3xl text-khaki-500">{f.no}</p>
              <p className="mt-2 text-lg font-bold text-army-800 dark:text-khaki-200">{f.title}</p>
              <p className="mt-2 text-sand-600 dark:text-sand-400">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="flex flex-col items-center gap-2 border-t border-sand-200 py-6 text-center text-sm text-sand-500 dark:border-sand-800">
        <p>부대명, 위치, 훈련 일정 같은 군사 정보는 기록하지 마세요.</p>
        <Link href="/privacy" className="underline hover:text-sand-700 dark:hover:text-sand-300">
          개인정보 처리방침
        </Link>
      </footer>
    </div>
  );
}
