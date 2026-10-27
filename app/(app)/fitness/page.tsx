import { connection } from "next/server";
import { getFitnessTests } from "@/lib/data";
import { formatRun } from "@/lib/fitness";
import { todayKST } from "@/lib/service";
import FitnessChart from "@/components/fitness-chart";
import FitnessForm from "@/components/fitness-form";
import FitnessRow from "@/components/fitness-row";
import AddPanel from "@/components/add-panel";
import { EmptyState, PageHeader, Panel, TwoColumn } from "@/components/page-frame";

export const instant = false; // layout.tsx 참고

// 체력검정 기록 (F-09). 자격증·독서와 같은 틀: 요약 3칸(최근 기록), 왼쪽 그래프·기록표(수정·삭제), 오른쪽 추가
export default async function FitnessPage() {
  await connection();
  const tests = await getFitnessTests();
  const today = todayKST();
  const latest = <K extends "pushups" | "situps" | "run_seconds">(key: K) =>
    [...tests].reverse().find((t) => t[key] !== null)?.[key] ?? null;
  const pushups = latest("pushups");
  const situps = latest("situps");
  const run = latest("run_seconds");

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="체력검정"
        description="검정 결과를 남기고 종목별 변화를 봐요."
        stats={[
          { label: "팔굽혀펴기", value: pushups !== null ? `${pushups}회` : "-" },
          { label: "윗몸일으키기", value: situps !== null ? `${situps}회` : "-" },
          { label: "3km", value: run !== null ? formatRun(run) : "-" },
        ]}
      />

      <TwoColumn
        aside={
          <AddPanel label="검정 결과 추가">
            <FitnessForm today={today} />
          </AddPanel>
        }
      >
        {tests.length === 0 ? (
          <EmptyState>아직 기록이 없어요. 검정을 보면 결과를 추가해 보세요.</EmptyState>
        ) : (
          <>
            <FitnessChart tests={tests} />
            <Panel title={`검정 기록 ${tests.length}회`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="text-left text-xs text-sand-500">
                    <tr>
                      <th className="py-2 font-medium">검정일</th>
                      <th className="py-2 font-medium">팔굽혀펴기</th>
                      <th className="py-2 font-medium">윗몸일으키기</th>
                      <th className="py-2 font-medium">3km</th>
                      <th className="py-2"><span className="sr-only">수정·삭제</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 dark:divide-sand-800">
                    {[...tests].reverse().map((t) => (
                      <FitnessRow key={t.id} test={t} today={today} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </TwoColumn>
    </main>
  );
}
