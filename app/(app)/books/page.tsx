import { connection } from "next/server";
import { getBooks } from "@/lib/data";
import { todayKST } from "@/lib/service";
import BookForm from "@/components/book-form";
import BookCard from "@/components/book-card";
import AddPanel from "@/components/add-panel";
import { EmptyState, PageHeader, TwoColumn } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

// 독서 기록 (F-08). 자격증·체력검정과 같은 틀: 요약 3칸, 왼쪽 카드 목록(수정·삭제), 오른쪽 추가
export default async function BooksPage() {
  await connection();
  const books = await getBooks();
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
          <AddPanel label="책 추가">
            <BookForm today={today} />
          </AddPanel>
        }
      >
        {books.length === 0 ? (
          <EmptyState>아직 기록한 책이 없어요. 첫 책을 추가해 보세요.</EmptyState>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {books.map((b) => (
              <BookCard key={b.id} book={b} today={today} />
            ))}
          </div>
        )}
      </TwoColumn>
    </main>
  );
}
