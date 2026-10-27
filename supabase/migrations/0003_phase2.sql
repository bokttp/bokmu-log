-- 복무로그 2차 기능 스키마 (명세 3.2, 5.1)
-- F-07 자격증 시험 정보, F-08 독서 기록, F-09 체력검정 기록, F-10 적금 계산기 정책 수치

-- F-07: 자격증 카테고리 목표의 부가 정보 (시험일, 결과)
create type exam_result as enum ('pending','pass','fail');
alter table goals
  add column exam_date date,
  add column exam_result exam_result;

-- F-08: 독서 기록
create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  author text check (char_length(author) <= 60),
  finished_on date,
  rating smallint check (rating between 1 and 5),
  review text check (char_length(review) <= 100),
  created_at timestamptz not null default now()
);
create index books_user_idx on books(user_id, finished_on desc);

-- F-09: 체력검정 기록 (세 종목 중 하나 이상)
create table fitness_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  tested_on date not null default current_date,
  pushups smallint check (pushups between 0 and 300),
  situps smallint check (situps between 0 and 300),
  run_seconds int check (run_seconds between 300 and 3600),
  created_at timestamptz not null default now(),
  check (pushups is not null or situps is not null or run_seconds is not null)
);
create index fitness_tests_user_idx on fitness_tests(user_id, tested_on);

-- F-10: 정책 수치 (제도 변경 시 이 테이블만 수정)
-- 적금 값은 2026-10 기준 공개 안내 글을 참고한 예시값이다. 국방부·은행 공지로 확인할 것.
create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into app_settings (key, value) values
  ('savings', '{"monthly_limit": 550000, "base_rate": 0.05, "match_ratio": 1.0, "max_months": 24}');

-- RLS (명세 6.1): 본인 행만, 정책 수치는 누구나 읽기만
alter table books enable row level security;
alter table fitness_tests enable row level security;
alter table app_settings enable row level security;

create policy "books_all_own" on books
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "fitness_tests_all_own" on fitness_tests
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "app_settings_read" on app_settings
  for select to anon, authenticated using (true);
