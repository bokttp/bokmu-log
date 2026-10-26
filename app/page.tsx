import Link from "next/link";

const FEATURES = [
  { title: "전역 D-day", body: "입대일만 넣으면 전역일과 복무율을 매일 보여줘요." },
  { title: "목표 관리", body: "자격증, 독서, 운동, 공부 목표를 세우고 진행 상황을 확인해요." },
  { title: "기록 잔디", body: "하루하루 쌓은 기록을 12주 잔디로 한눈에 봐요." },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-12">
      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">복무로그</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight">
        전역할 때,
        <br />
        내가 해낸 것을 보여줄 수 있도록
      </h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        복무 기간 동안의 자기계발을 기록하고, 남은 시간 안에 무엇을 해낼지 매일 확인하세요.
      </p>

      <ul className="mt-10 flex flex-col gap-3">
        {FEATURES.map((f) => (
          <li
            key={f.title}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="font-semibold">{f.title}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{f.body}</p>
          </li>
        ))}
      </ul>

      <Link
        href="/login"
        className="mt-10 flex h-12 items-center justify-center rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
      >
        시작하기
      </Link>
    </main>
  );
}
