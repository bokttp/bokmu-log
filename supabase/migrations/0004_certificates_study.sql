-- 목표 화면을 자격증·공부로 나눈다 (2026-10-27 결정, PLAN.md 결정 기록)
-- 자격증: 종류·시행기관·단계별 시험(필기·실기)·취득일. 공부: 과목별 목표와 공부 기록.
-- 공부 기록(records)은 과목 또는 자격증 아래에 쌓인다. goals 표는 지우지 않고 남겨 둔다.

create type cert_kind as enum ('national_tech','national_pro','private','language');
create type cert_status as enum ('preparing','acquired','dropped');
create type exam_stage as enum ('written','practical','single');

create table certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  kind cert_kind not null default 'national_tech',
  issuer text check (char_length(issuer) <= 40),
  status cert_status not null default 'preparing',
  acquired_on date,
  memo text check (char_length(memo) <= 500),
  legacy_goal_id uuid,  -- 옮겨 온 목표 (한 번만 쓰는 연결용)
  created_at timestamptz not null default now()
);
create index certificates_user_idx on certificates(user_id, status);

create table cert_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  certificate_id uuid not null references certificates(id) on delete cascade,
  stage exam_stage not null default 'single',
  exam_date date,
  result exam_result not null default 'pending',
  score smallint check (score between 0 and 1000),
  created_at timestamptz not null default now()
);
create index cert_exams_cert_idx on cert_exams(certificate_id, exam_date);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  target text check (char_length(target) <= 60),
  target_date date,
  archived boolean not null default false,
  legacy_goal_id uuid,
  created_at timestamptz not null default now()
);
create index subjects_user_idx on subjects(user_id, archived);

alter table records
  add column subject_id uuid references subjects(id) on delete set null,
  add column certificate_id uuid references certificates(id) on delete set null;

-- 기존 목표 옮기기: 자격증 목표 → certificates (+ 시험 정보), 공부 목표 → subjects, 연결된 기록도 따라온다
insert into certificates (user_id, name, status, acquired_on, memo, legacy_goal_id, created_at)
select user_id, left(title, 60),
       case status when 'done' then 'acquired'::cert_status when 'dropped' then 'dropped'::cert_status else 'preparing'::cert_status end,
       case when status = 'done' then completed_at::date end,
       memo, id, created_at
from goals where category = 'certificate';

insert into cert_exams (user_id, certificate_id, stage, exam_date, result)
select c.user_id, c.id, 'single', g.exam_date, coalesce(g.exam_result, 'pending')
from certificates c join goals g on g.id = c.legacy_goal_id
where g.exam_date is not null;

insert into subjects (user_id, name, target, target_date, archived, legacy_goal_id, created_at)
select user_id, left(title, 30), case when char_length(title) > 30 then left(title, 60) end, target_date, status <> 'in_progress', id, created_at
from goals where category = 'study';

update records r set certificate_id = c.id from certificates c where c.legacy_goal_id = r.goal_id;
update records r set subject_id = s.id from subjects s where s.legacy_goal_id = r.goal_id;

-- RLS (명세 6.1): 본인 행만. 시험·기록이 가리키는 자격증·과목도 본인 것이어야 한다.
alter table certificates enable row level security;
alter table cert_exams enable row level security;
alter table subjects enable row level security;

create policy "certificates_all_own" on certificates
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "cert_exams_all_own" on cert_exams
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from certificates c where c.id = certificate_id and c.user_id = (select auth.uid()))
  );

create policy "subjects_all_own" on subjects
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy "records_all_own" on records;
create policy "records_all_own" on records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (goal_id is null or exists (select 1 from goals g where g.id = goal_id and g.user_id = (select auth.uid())))
    and (subject_id is null or exists (select 1 from subjects s where s.id = subject_id and s.user_id = (select auth.uid())))
    and (certificate_id is null or exists (select 1 from certificates c where c.id = certificate_id and c.user_id = (select auth.uid())))
  );
