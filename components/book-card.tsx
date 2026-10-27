"use client";

import { useState } from "react";
import { deleteBook } from "@/lib/actions";
import type { Book } from "@/lib/types";
import BookForm from "./book-form";
import DeleteRowButton from "./delete-row-button";

// 책 카드 (자격증 카드와 같은 모양): 위에 상태 태그 + 별점, 가운데 제목·한줄평, 아래 저자·완독일과 수정·삭제.
// "수정"을 누르면 같은 자리에서 고친다.
export default function BookCard({ book, today }: { book: Book; today: string }) {
  const [editing, setEditing] = useState(false);
  const box = "flex flex-col rounded-2xl border border-sand-200 bg-white/80 p-4 shadow-sm dark:border-sand-800 dark:bg-sand-900/60";

  if (editing) {
    return (
      <article className={box}>
        <BookForm today={today} book={book} onDone={() => setEditing(false)} />
      </article>
    );
  }

  return (
    <article className={`${box} ${book.finished_on ? "" : "ring-1 ring-khaki-300"}`}>
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
        <div className="flex shrink-0 items-start">
          <button type="button" onClick={() => setEditing(true)} className="h-11 rounded-lg px-3 text-sm text-sand-600 hover:bg-sand-100 dark:text-sand-400 dark:hover:bg-sand-800">
            수정
          </button>
          <DeleteRowButton id={book.id} action={deleteBook} confirmText="이 책 기록을 지울까요? 되돌릴 수 없어요." />
        </div>
      </div>
    </article>
  );
}
