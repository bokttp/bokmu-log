-- 복무로그 MVP 스키마 (명세 5.2)

-- 군종
create type branch as enum ('army','navy','airforce','marine','social');
create type goal_category as enum ('certificate','reading','exercise','study','etc');
create type goal_status as enum ('in_progress','done','dropped');

-- 군종별 복무 기간 (제도 변경 시 이 테이블만 수정)
-- 개월 수는 예시값이다. 배포 전 병무청 공지로 확인할 것.
create table service_periods (
  branch branch primary key,
  months int not null check (months between 1 and 48),
  label text not null
);
insert into service_periods values
  ('army', 18, '육군'),
  ('navy', 20, '해군'),
  ('airforce', 21, '공군'),
  ('marine', 18, '해병대'),
  ('social', 21, '사회복무요원');

-- 프로필
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text check (char_length(nickname) between 2 and 12),
  branch branch,
  enlist_date date,
  discharge_date date,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  check (discharge_date is null or discharge_date > enlist_date)
);

-- 목표
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  category goal_category not null,
  title text not null check (char_length(title) between 1 and 60),
  memo text check (char_length(memo) <= 500),
  target_date date,
  status goal_status not null default 'in_progress',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index goals_user_idx on goals(user_id, status, target_date);

-- 활동 기록
create table records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  goal_id uuid references goals(id) on delete set null,
  date date not null default current_date,
  content text not null check (char_length(content) between 1 and 200),
  minutes int check (minutes between 1 and 1440),
  created_at timestamptz not null default now()
);
create index records_user_date_idx on records(user_id, date desc);

-- 가입 시 프로필 자동 생성
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
