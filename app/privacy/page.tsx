import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "개인정보 처리방침 · 복무로그" };

// 시행일. 내용을 바꾸면 날짜도 바꾼다.
const EFFECTIVE_DATE = "2026년 10월 27일";
// 문의 이메일은 Vercel 환경변수 NEXT_PUBLIC_CONTACT_EMAIL로 넣는다 (없으면 문의 줄을 숨긴다)
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

const ITEMS = [
  { item: "이메일 주소", purpose: "로그인 링크 발송, 계정 구분", when: "가입할 때" },
  { item: "닉네임, 군종, 입대일, 전역일", purpose: "전역 D-day·복무율·진급 예상일 계산", when: "온보딩·설정에서" },
  { item: "목표, 활동 기록 (내용·날짜·시간)", purpose: "기록 저장, 대시보드·잔디 표시", when: "직접 입력할 때" },
];

const PROCESSORS = [
  { name: "Supabase", role: "로그인, 데이터베이스 저장", where: "대한민국 서울 리전" },
  { name: "Vercel", role: "웹사이트 호스팅·배포", where: "Vercel 글로벌 네트워크" },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 md:px-8">
          <Link href="/" className="text-lg font-bold text-emerald-800 dark:text-emerald-400">
            복무로그
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-14">
        <h1 className="text-3xl font-bold">개인정보 처리방침</h1>
        <p className="mt-2 text-sm text-zinc-500">시행일: {EFFECTIVE_DATE}</p>
        <p className="mt-6 leading-7 text-zinc-700 dark:text-zinc-300">
          복무로그는 장병의 자기계발 기록을 돕기 위해 꼭 필요한 정보만 받아요. 실명, 군번, 생년월일, 부대명, 부대 위치, 훈련
          일정은 받지 않아요.
        </p>

        <Section title="1. 받는 정보와 쓰는 곳">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-2 pr-4 font-medium">항목</th>
                  <th className="py-2 pr-4 font-medium">쓰는 곳</th>
                  <th className="py-2 font-medium">받는 때</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {ITEMS.map((r) => (
                  <tr key={r.item}>
                    <td className="py-3 pr-4 font-medium">{r.item}</td>
                    <td className="py-3 pr-4">{r.purpose}</td>
                    <td className="py-3">{r.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>받은 정보는 위 목적에만 쓰고, 광고나 판매에 쓰지 않아요.</p>
        </Section>

        <Section title="2. 보관 기간과 삭제">
          <p>회원 탈퇴할 때까지 보관해요. 설정 화면의 &ldquo;회원 탈퇴&rdquo;를 누르면 계정과 모든 목표·기록이 바로 지워지고 되돌릴 수 없어요.</p>
          <p>닉네임, 복무 정보, 목표, 기록은 언제든 직접 고치거나 지울 수 있어요.</p>
        </Section>

        <Section title="3. 정보를 맡기는 곳">
          <ul className="list-disc space-y-1 pl-5">
            {PROCESSORS.map((p) => (
              <li key={p.name}>
                <span className="font-medium">{p.name}</span> — {p.role} ({p.where})
              </li>
            ))}
          </ul>
          <p>위 서비스 외의 다른 곳에 정보를 주지 않아요. 법에 따라 요청이 있는 경우는 예외예요.</p>
        </Section>

        <Section title="4. 정보 보호">
          <p>모든 기록은 데이터베이스 행 수준 보안(RLS)으로 본인만 읽고 쓸 수 있어요. 통신은 HTTPS로 암호화돼요.</p>
        </Section>

        <Section title="5. 쿠키">
          <p>로그인 상태를 유지하는 쿠키만 써요. 광고·분석 쿠키는 쓰지 않아요.</p>
        </Section>

        {CONTACT && (
          <Section title="6. 문의">
            <p>
              개인정보 관련 문의: <a href={`mailto:${CONTACT}`} className="text-emerald-700 underline dark:text-emerald-400">{CONTACT}</a>
            </p>
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-zinc-700 dark:text-zinc-300">{children}</div>
    </section>
  );
}
