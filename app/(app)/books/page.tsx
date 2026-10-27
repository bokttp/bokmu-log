import { connection } from "next/server";
import { getBooks, getGoals } from "@/lib/data";
import { deleteBook } from "@/lib/actions";
import { todayKST } from "@/lib/service";
import type { Book } from "@/lib/types";
import BookForm from "@/components/book-form";
import AddPanel from "@/components/add-panel";
import DeleteRowButton from "@/components/delete-row-button";
import RelatedGoals from "@/components/related-goals";
import { EmptyState, PageHeader, TwoColumn } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

// 독서 기록 (F-08). 목표·체력검정과 같은 틀: 요약 3칸, 왼쪽 카드 목록, 오른쪽 추가 + 관련 목표
export default async function BooksPage() {
  await connection();
  const [books, goals] = await Promise.all([getBooks(), getGoals()]);
  const today = todayKST();
  const year = today.slice(0, 4);
  const finished = books.filter((b) => b.finished_on);
  const rated = finished.filter((b) => b.rating);
  const avg = rated.length ? Math.round((rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length) * 10) / 10 : null;

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="독서"
        description="읽은 책과 한줄평을 남겨요."
        stats={[
          { label: "완독", value: `${finished.length}권` },
          { label: `${year}년`, value: `${finished.filter((b) => b.finished_on?.startsWith(year)).length}권` },
          { label: "평균 별점", value: avg !== null ? `${avg}점` : "-" },
        ]}
      />

      <TwoColumn
        aside={
          <>
            <AddPanel label="책 추가">
              <BookForm today={today} />
            </AddPanel>
            <RelatedGoals goals={goals} category="reading" today={today} emptyText="독서 목표 만들기" />
          </>
        }
      >
        {books.length === 0 ? (
          <EmptyState>아직 기록한 책이 없어요. 첫 책을 추가해 보세요.</EmptyState>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </TwoColumn>
    </main>
  );
}

// 목표 카드와 같은 모양: 위에 상태 태그 + 오른쪽 값, 가운데 제목, 아래 보조 정보
function BookCard({ book }: { book: Book }) {
  return (
    <article className={`flex flex-col rounded-2xl border border-sand-200 bg-white/80 p-4 shadow-sm dark:border-sand-800 dark:bg-sand-900/60 ${book.finished_on ? "" : "ring-1 ring-khaki-300"}`}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="rounded bg-khaki-200 px-2 py-0.5 font-semibold text-army-900 dark:bg-army-800 dark:text-khaki-200">
          {book.finished_on ? "완독" : "읽는 중"}
        </span>
        {book.rating && (
          <span className="text-sm text-army-700 dark:text-khaki-300" aria-label={`별점 ${book.rating}점`}>
            {"★".repeat(book.rating)}
            <span className="text-sand-300 dark:text-sand-700">{"★".repeat(5 - book.rating)}</span>
          </span>
        )}
      </div>
      <p className="mt-2 font-semibold break-words">{book.title}</p>
      {book.review && <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">“{book.review}”</p>}
      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <p className="text-sm text-sand-500">
          {[book.author, book.finished_on?.replaceAll("-", ".")].filter(Boolean).join(" · ")}
        </p>
        <DeleteRowButton id={book.id} action={deleteBook} confirmText="이 책 기록을 지울까요? 되돌릴 수 없어요." />
      </div>
    </article>
  );
}
