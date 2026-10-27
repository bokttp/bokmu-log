import { connection } from "next/server";
import { getBooks } from "@/lib/data";
import { deleteBook } from "@/lib/actions";
import { todayKST } from "@/lib/service";
import BookForm from "@/components/book-form";
import DeleteRowButton from "@/components/delete-row-button";

export const instant = false; // layout.tsx 참고

// 독서 기록 (F-08): 왼쪽 목록, 오른쪽 추가 폼
export default async function BooksPage() {
  await connection();
  const books = await getBooks();
  const today = todayKST();
  const year = today.slice(0, 4);
  const finished = books.filter((b) => b.finished_on);
  const thisYear = finished.filter((b) => b.finished_on?.startsWith(year)).length;
  const rated = finished.filter((b) => b.rating);
  const avg = rated.length ? Math.round((rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length) * 10) / 10 : null;

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">독서</h1>
        <p className="mt-1 text-sm text-sand-500">
          완독 {finished.length}권 · {year}년 {thisYear}권{avg !== null && ` · 평균 별점 ${avg}`}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <section className="rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-sm dark:border-sand-800 dark:bg-sand-900/60">
          {books.length === 0 ? (
            <p className="py-16 text-center text-sm text-sand-500">아직 기록한 책이 없어요. 첫 책을 추가해 보세요.</p>
          ) : (
            <ul className="divide-y divide-sand-200 dark:divide-sand-800">
              {books.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">
                      {b.title}
                      {b.author && <span className="ml-2 text-sm font-normal text-sand-500">{b.author}</span>}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      {b.finished_on ? (
                        <span className="text-sand-500">{b.finished_on.replaceAll("-", ".")} 완독</span>
                      ) : (
                        <span className="rounded bg-khaki-200 px-2 py-0.5 text-xs font-semibold text-army-900 dark:bg-army-800 dark:text-khaki-200">읽는 중</span>
                      )}
                      {b.rating && (
                        <span className="text-army-700 dark:text-khaki-300" aria-label={`별점 ${b.rating}점`}>
                          {"★".repeat(b.rating)}
                          <span className="text-sand-300 dark:text-sand-700">{"★".repeat(5 - b.rating)}</span>
                        </span>
                      )}
                    </p>
                    {b.review && <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">“{b.review}”</p>}
                  </div>
                  <DeleteRowButton id={b.id} action={deleteBook} confirmText="이 책 기록을 지울까요? 되돌릴 수 없어요." />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="order-first lg:sticky lg:top-24 lg:order-none">
          <BookForm today={today} />
        </aside>
      </div>
    </main>
  );
}
