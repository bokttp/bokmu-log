// DB 테이블 모양 (명세 5.2). Supabase 연결 후 supabase gen types로 교체한다.

export type Branch = "army" | "navy" | "airforce" | "marine" | "social";
export type GoalCategory = "certificate" | "reading" | "exercise" | "study" | "etc";
export type GoalStatus = "in_progress" | "done" | "dropped";

export type Profile = {
  id: string;
  nickname: string | null;
  branch: Branch | null;
  enlist_date: string | null;
  discharge_date: string | null;
  onboarded: boolean;
};

export type Goal = {
  id: string;
  category: GoalCategory;
  title: string;
  memo: string | null;
  target_date: string | null;
  status: GoalStatus;
  completed_at: string | null;
  record_count: number;
};

export type ActivityRecord = {
  id: string;
  goal_id: string | null;
  date: string;
  content: string;
  minutes: number | null;
};

export const BRANCH_LABELS: Record<Branch, string> = {
  army: "육군",
  navy: "해군",
  airforce: "공군",
  marine: "해병대",
  social: "사회복무요원",
};

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  certificate: "자격증",
  reading: "독서",
  exercise: "운동",
  study: "공부",
  etc: "기타",
};

export const STATUS_LABELS: Record<GoalStatus, string> = {
  in_progress: "진행 중",
  done: "완료",
  dropped: "포기",
};
