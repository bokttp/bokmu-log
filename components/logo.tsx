import Link from "next/link";

// 로고: 별 + 복무로그 + 스텐실 영문. tone="dark"는 올리브 배경 위(헤더)용.
export default function Logo({ href = "/", tone = "light" }: { href?: string; tone?: "light" | "dark" }) {
  const main = tone === "dark" ? "text-khaki-100" : "text-army-800 dark:text-khaki-200";
  const sub = tone === "dark" ? "text-khaki-300" : "text-khaki-500 dark:text-khaki-400";

  return (
    <Link href={href} className="flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-khaki-300" aria-hidden>
        <path fill="currentColor" d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7.1L12 17.3 5.8 21l1.6-7.1L2 9.2l7.1-.6z" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`text-lg font-bold ${main}`}>복무로그</span>
        <span className={`font-stencil text-[10px] tracking-[0.2em] ${sub}`}>BOKMU LOG</span>
      </span>
    </Link>
  );
}
